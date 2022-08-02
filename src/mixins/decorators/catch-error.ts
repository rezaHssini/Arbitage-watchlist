import { Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsyncMethodDecorator } from '../interfaces/async-method-decorator';

export function CatchErrors(
  configInstanceKey = '__config',
  bubble = true,
): AsyncMethodDecorator {
  const injectConfig = Inject(ConfigService);

  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    if (!target[configInstanceKey]) {
      try {
        injectConfig(target, configInstanceKey);
        Optional()(target, configInstanceKey);
      } catch (e) {}
    }

    // get original method
    const originalMethod = propertyDescriptor.value;

    // redefine descriptor value within own function block
    propertyDescriptor.value = async function (...args: any[]): Promise<any> {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const config: ConfigService = this[configInstanceKey];
        const logSilent = config.get('LOG_SILENT') === 'true' ? true : false;
        const targetName =
          typeof target === 'function' ? target.name : target.constructor.name;
        error = typeof error === 'string' ? new Error(error) : error;
        error.message = `${targetName}::${propertyKey} ${error.message}`;
        if (logSilent) {
          console.time(`${error.message}\nError stack: ${error.stack}`);
        }

        // rethrow error, so it can bubble up
        if (bubble) {
          throw error;
        }
      }
    };
  };
}
