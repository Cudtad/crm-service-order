import classNames from "classnames";
import CommonFunction from '@lib/common';

const Templates = {
    // default
    default: {
        itemtemplate: (item) => {
            return (<div>{item.value}</div>);
        },
        selecteditemtemplate: (item) => {
            return (<div>{item.value}</div>);
        }
    },
    // template for user
    user: {
        itemtemplate: (item) => {
            return (
                <div className="flex align-items-stretch">
                    <img className="autocomplete-user-avatar" src={CommonFunction.getImageUrl(item.avatar, item.value)} />
                    <div className={classNames({ "pt-1": true, "p-text-line-through": item.status === 1 })}>
                        <div className="bold-and-color">{item.value}</div>
                        <div className="text-grey mt-1">{CommonFunction.t("org") + " : "} {item.orgs && item.orgs.map(m => m.name).join(", ")}</div>
                    </div>
                </div>
            )
        },
        selecteditemtemplate: (item) => {
            return (
                <div className="flex align-items-center">
                    <img className="autocomplete-user-avatar" src={CommonFunction.getImageUrl(item.avatar, item.value)} />
                    <div>{item.value}</div>
                </div>
            )
        }
    }
}

/**
 * get item template
 * @param {*} type 
 * @returns 
 */
const getItemTemplate = (type) => {
    if (Templates[type]) {
        return Templates[type].itemtemplate;
    } else {
        return Templates.default.itemtemplate
    }

}

/**
 * get selected item template
 * @param {*} type 
 * @returns 
 */
const getSelecteditemtemplate = (type) => {
    if (Templates[type]) {
        return Templates[type].selecteditemtemplate;
    } else {
        return Templates.default.selecteditemtemplate
    }

}

const DynamicOutbounceDataTemplate = {
    getItemTemplate: getItemTemplate,
    getSelecteditemtemplate: getSelecteditemtemplate
}

export default DynamicOutbounceDataTemplate;