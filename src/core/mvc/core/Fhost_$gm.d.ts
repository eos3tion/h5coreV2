interface $gmType {
    /**
     * 主控类型，包括Proxy和Mediator
     * 
     * @type {{ [index: string]: jy.FHost }}
     * @memberof $gmType
     */
    $: { [index: string]: import("./FHost").FHost };
}