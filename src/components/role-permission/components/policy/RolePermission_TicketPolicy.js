import CommonFunction from '@lib/common';
                    import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import _ from 'lodash';
import { XLayout, XLayout_Center } from '@ui-lib/x-layout/XLayout';
import { Checkbox } from 'primereact/checkbox';

/**
 * return {
 *      valid: true/false,
 *      policy: {
 *          "groups":[
 *              { "id" : 1,"scopeType": "direct"},
 *              {"id" : 1, "scopeType": "recursive"}
 *           ],
 *          "types": ["TICKET","CHANGE"]
 *      }
 * }
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 */
function RolePermission_TicketPolicy(props, ref) {
    const t = CommonFunction.t;
    const { role } = props;
    const defaultPolicy = { ticket: false, change: false, problem: false };
    const [policy, setPolicy] = useState(defaultPolicy);

    useImperativeHandle(ref, () => ({
        setPolicy: (_policy) => {
            applyPolicy(_policy);
        },
        getPolicy: () => {
            let _returnPolicy = [];
            if (policy.ticket) _returnPolicy.push("TICKET");
            if (policy.change) _returnPolicy.push("CHANGE");
            if (policy.problem) _returnPolicy.push("PROBLEM");
            return { valid: true, policy: { types: _returnPolicy } };
        }
    }));

    useEffect(() => {
        applyPolicy();
    }, [role])

    const applyPolicy = async (_policy) => {
        _policy = _policy || (role ? role.policy : null);
        if (_policy && _policy.types && Array.isArray(_policy.types) && _policy.types.length > 0) {
            let _applyPolicy = _.cloneDeep(defaultPolicy);
            _policy.types.forEach(el => {
                switch (el) {
                    case "TICKET":
                        _applyPolicy.ticket = true;
                        break;
                    case "CHANGE":
                        _applyPolicy.change = true;
                        break;
                    case "PROBLEM":
                        _applyPolicy.problem = true;
                        break;
                    default:
                        break;
                }
            });
            setPolicy(_applyPolicy);
        } else {
            setPolicy(_.cloneDeep(defaultPolicy));
        }

    }

    /**
     * apply policy change
     * @param {*} _group 
     * @param {*} value 
     */
    const applyPolicyChange = (prop, value) => {
        let _policy = _.cloneDeep(policy);
        _policy[prop] = value;
        setPolicy(_policy);
    }

    return (<>
        <XLayout>
            <XLayout_Center className="p-2">
                <div className="p-field-checkbox">
                    <Checkbox
                        inputId="ticket_ticket"
                        onChange={(e) => applyPolicyChange("ticket", e.checked)}
                        checked={policy.ticket}
                    ></Checkbox>
                    <label htmlFor="ticket_ticket">{t("ticket.ticket")}</label>
                </div>
                <div className="p-field-checkbox">
                    <Checkbox
                        inputId="ticket_change"
                        onChange={(e) => applyPolicyChange("change", e.checked)}
                        checked={policy.change}
                    ></Checkbox>
                    <label htmlFor="ticket_change">{t("ticket.change")}</label>
                </div>
                <div className="p-field-checkbox">
                    <Checkbox
                        inputId="ticket_problem"
                        onChange={(e) => applyPolicyChange("problem", e.checked)}
                        checked={policy.problem}
                    ></Checkbox>
                    <label htmlFor="ticket_problem">{t("ticket.problem")}</label>
                </div>
            </XLayout_Center>
        </XLayout>
    </>);
};

RolePermission_TicketPolicy = forwardRef(RolePermission_TicketPolicy);

export default RolePermission_TicketPolicy;
