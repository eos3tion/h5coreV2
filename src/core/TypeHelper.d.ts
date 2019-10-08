/**
 * 用于获取`Promise`的原类型  
 * @example
 * async function a(){
 *      return {
 *          a:123,
 *          b:true
 *      }
 * }
 * 
 * type Type_a = PromiseInfer<ReturnType<typeof a>>;
 */
declare type PromiseInfer<T> = T extends Promise<infer T> ? T : any;