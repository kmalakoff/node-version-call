export interface JSONObject {
    [x: string]: any;
}
export declare type CallOptions = {
    args?: any[];
    env?: JSONObject;
};
export default function call(filePath: string, version: string, options?: CallOptions): any;
