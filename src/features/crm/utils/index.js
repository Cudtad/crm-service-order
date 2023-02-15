import React from 'react';
import CommonFunction from '@lib/common';
import _ from 'lodash';
import { CrmUserApi } from '../../../services/crm/CrmUser';
import { IGNORE_PERMISSION } from './constants';

export const getPermistion = (user, permisstion) => {
    if (user?.menuActions) {
        return user?.menuActions[permisstion]
    }
    return null
}

export const getPermistionAlway = (type, application, permisstion, callBack) => {
    CrmUserApi.getUserMenuPermission(type, application, null, null).then(res => {
        if (res?.menuActions) {
            callBack(res?.menuActions[permisstion])
        } else {
            callBack(null)
        }
    })
}

export const convertUsers = (users) => {
    return users.map(o => {
        return {
            ...o,
            _key: o.fullName?.toLowerCase()
        }
    })
}

export const makeRandomId = (length) => {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength))
    }
    return result
}

export const getMenu = (t, history, application, type, id, selected, parentCode, callBack) => {
    CrmUserApi.getUserMenuPermission(type, application, null, null).then(res => {
        // build menu
        let _menu = [], permission = {}, _selected, _to, _selectedIndex = 0;
        // remove root node
        const filterMenus = _.filter(res.menuAllow, { type, application })
        _menu = filterMenus.map((el, index) => {
            const to = CommonFunction.isEmpty(el.urlMfe) ? null : `${el.urlMfe}/${id}`
            // mark selected
            if (selected === el.code) {
                _selected = el.code;
                _to = to;
            }
            return {
                code: el.code,
                parentCode: el.parentCode === parentCode ? null : el.parentCode, // remove root node
                sortOrder: el.sortOrder,
                to: to,
                label: t(el.name),
                leaf: !CommonFunction.isEmpty(el.urlMfe)
            }
        })

        if (_menu.length > 0) {
            // build tree
            _menu = _.sortBy(_menu, "sortOrder");
            _menu = CommonFunction.listToTree(_menu, "code", "parentCode", "items");
        } else {
            history("/403");
            callBack(null)
        }

        // get selected
        if (CommonFunction.isEmpty(_selected)) {
            let find = _.find(_menu, { items: [{ leaf: true }] }); // find nested item
            if (!find) find = _.find(_menu, { leaf: true }); // find first level
            if (find) {
                if (find.leaf) {
                    _selected = find.code;
                    _to = find.to;
                } else if (find.items) {
                    for (let i = 0; i < find.items.length; i++) {
                        if (find.items[i].leaf) {
                            _selected = find.items[i].code;
                            _to = find.items[i].to;
                            break;
                        }
                    }
                }
            }
        }

        // navigate to first allowed menu
        if (window.location.hash !== _to) {
            // history(_to.replace("#", ""));
        }
        let _activeMenu = []
        _menu.map(o => {
            if (IGNORE_PERMISSION.indexOf(o.code) == -1) {
                _activeMenu.push(o)
            }
        })

        _selectedIndex = _.findIndex(_activeMenu, { code: _selected })
        callBack({ menu: _activeMenu, selected: _selected, selectedIndex: _selectedIndex })
    })
}

export const formatNum = (num , decimals = 10) => {
    if (num) {
        let pint = true
        let result = '';
        let numx = parseFloat(num)
        if (numx < 0) {
            pint = false
            numx = numx * -1
        }

        let numFloat = numx.toString()
        let arrNumFloat = numFloat.split('.')
        if (arrNumFloat.length) {
            let cut = arrNumFloat[0]
            while (cut.length > 3) {
                const per = cut.substring(cut.length - 3, cut.length);
                cut = cut.substring(0, cut.length - 3);
                result = result != '' ? per + ',' + result : per;
            }
            result = result != '' ? cut + ',' + result : cut;
            return `${!pint ? '-' : ''}${result}${arrNumFloat.length == 2 ? `.${arrNumFloat[1].slice(0,decimals)}` : ``}`;
        } else {
            return '0';
        }
    }
    return '0';
}

export const calculateYear = (start, end) => {
    var startYear = start.getFullYear();
    var endYear = end.getFullYear();

    var year = endYear - startYear;

    var startMonth = start.getMonth();
    var endMonth = end.getMonth();

    var startDay = start.getDate();
    var endDay = end.getDate();

    if (endMonth < startMonth) {
        year--;
    } else if (endMonth == startMonth && endDay < startDay) {
        year--;
    }

    return year;

}

export const calculateMonth = (start, end) => {

    var startMonth = start.getMonth();
    var endMonth = end.getMonth();

    var month = endMonth - startMonth;

    var startDay = start.getDate();
    var endDay = end.getDate();



    if (month < 0) {
        month = 12 - startMonth + endMonth;
    }

    if (endDay < startDay) {
        month--;
    }

    if (month < 0) {
        month = 11;
    }

    return month;

}

export const calculateDay = (start, end) => {


    var startDay = start.getDate();
    var endDay = end.getDate();

    var day = endDay - startDay;

    if (endDay < startDay) {
        var totalDayOfStartMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
        day = totalDayOfStartMonth - startDay + endDay;
    }

    return day;
}

export const calculateTotalDay = (start, end) => {

    var diffrentInTime = start.getTime() - end.getTime();

    var diffrentInDay = diffrentInTime / (1000 * 3600 * 24);

    return diffrentInDay;

}

export const formatSize = (num) => {
    if (num) {
        if (num < 1000000) {
            return `${Math.round(num / 1000)} KB`
        } else {
            return `${formatNum(Math.round(num / 1000))} MB`
        }
    }

    return `0 KB`;
}

export const currencyVnd = Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
})


export const renderIconCRM = ({ icon, bg }) => {
    return (
        <div className={`${bg} border-round-sm flex justify-content-center align-items-center p-1 h-full`}>
            <i className={`${icon} text-4xl text-white`}></i>
        </div>
    )
}

export const getTerm = (startDate, endDate) => {
   
    if(startDate && endDate){
        const startCalDate = new Date(startDate)
        const endCalDate = new Date(endDate)
        const day = calculateDay(startCalDate ,endCalDate)
        const month = calculateMonth(startCalDate , endCalDate)
        const year = calculateYear(startCalDate , endCalDate)
        return `${year} năm, ${month} tháng, ${day} ngày`
    }
    return ''
}

export const renderAmountByCurrency = (
    amount,
    currencyMain = { conversionRate: 0, currencyCode: "" },
    currencyConvert = { conversionRate: 0, currencyCode: "" }
  ) => {
    return `${formatNum(+amount, 2)} ${currencyMain?.currencyCode} ${
      currencyMain && currencyMain.currencyCode !== currencyConvert.currencyCode
        ? ` (${formatNum(+amount / +currencyMain?.conversionRate, 2)} ${
            currencyConvert?.currencyCode
          })`
        : ""
    }`;
  };
  

