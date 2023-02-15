import SharedFunction from '@ngdox/ui-lib/dist/lib/sharedFunctionClass';
import appSettings from 'appSettings';

const locales = {
    vi: require("../locales/vi.json"),
    en: require("../locales/en.json")
}
const CommonFunction = new SharedFunction(
    {
        apiUrl: appSettings.api.url,
        locales: locales
    }
)

/**
 * find value of 'prop' in 'arr' has exist with 'val'
 * @param {*} arr
 * @param {*} prop
 * @param {*} obj
 */
 CommonFunction.isExist = function (arr, prop, obj) {
    let index = this.findArrayIndex(arr, prop, obj[prop])[0];
    if (index > -1) {
        arr = arr.filter(o => arr[index] !== o)
        console.log(arr)
    }
    return index > -1 ? true : false;
}.bind(CommonFunction)

export default CommonFunction;