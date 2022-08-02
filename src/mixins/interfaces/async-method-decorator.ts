// Type for Decorator for async class methods
export type AsyncMethodDecorator<Type = any>
  = <T extends ((...args: any[]) => Promise<Type>)>
      (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<Type>)
        => TypedPropertyDescriptor<T> | void;
