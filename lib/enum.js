const Enumeration = {
    locales: [
        { id: "vi", name: "Tiếng Việt" },
        { id: "en", name: "English" }
    ],
    crud: {
        create: "create",
        read: "read",
        update: "update",
        copy: "copy",
        delete: "delete",
        none: "none",
        search:"search",
        filter:"filter",
        view:"view",
        status: {
            active: {
                code: 1,
                name: "boolean.status.1"
            },
            denied: {
                code: 0,
                name: "boolean.status.0"
            }
        }
    },
    dictionary: {
        year_range:"year_range",
        status_online:"status_online",
        location_factory:"location_factory",
        type_sku: "type_sku",
        status_gr:"status_gr",
        unify_version:"unify_version",
        monetary_unit: "monetary_unit",
        list_productType:"list_productType",
        type_plan: "type_plan",
        type_plan_detail: "type_plan_detail",
        list_report_template: "list_report_template",
        status_plan_and_desire: "status_plan_and_desire",
        list_template: "list_template",
        status_plan: "status_plan",
        type_currency_exchange_rate: "type_currency_exchange_rate",
        type_year_and_phase: "type_year_and_phase",
        status_investment_project: "status_investment_project",
        group_unit: "group_unit",
        evaluation_group: "evaluation_group",
        field: "field",
        type_lm: "type_lm",
        formality: "formality",
        group_project: "group_project",
        type_working_unit: "type_working_unit",
        type_project: "type_project",
        status: "status",
        phase:"phase",
        fund:"fund",
        gender: "gender",
        employee_position: "employee_position",
        employee_title: "employee_title",
        employee_level: "employee_level",
        leave_type: "leave_type",
        contract_type:"contract_type",
        identification_type: "identification_type",
        organization_type: "organization_type",
        social_network: "social_network",
        antecedents: "antecedents",
        nationality: "nationality",
        nation: "nation",
        religion: "religion",
        marital_status: "marital_status",
        bank: "bank",
        profile_status: "profile_status",
        onboarding : "onboarding",
        evaluation_criteria:"evaluation_criteria",
        form_importance:"form_importance",
        form_type:"form_type",
        cost_type:"cost_type",
        currency:"currency",
        employee_field:"employee_field",
        recruitment_resources:"recruitment_resources",
        academic_level:"academic_level",
        language_level:"language_level",
        recruiting_role:"recruiting_role",
        language:"language",
        timekeeping_type:"timekeeping_type",
        reason_quit:"reason_quit"
    },
    workflow_document_type: {
        template: "template",
        reference: "reference",
        inTask: "in-task",
        inRequest: "in-request"
    },
    customfield_datatype: {
        STRING: "STRING",
        LONG: "LONG",
        DOUBLE: "DOUBLE",
        DATE: "DATE",
        DATE_TIME: "DATE_TIME",
        BOOLEAN: "BOOLEAN",
        LIST_SINGLE: "LIST_SINGLE",
        LIST_MULTI: "LIST_MULTI"

    },
    task: {
        role: {
            responsible: "RESPONSIBLE",
            participant: "PARTICIPANT",
            following: "FOLLOWING",
            requester: "REQUESTER",
            createBy: "CREATEBY",
            obServer: "OBSERVER",
            approval: "APPROVAL",
            delegate: "DELEGATE",
        },
        state: {
            pending: "PENDING",
            inProgress: "IN_PROGRESS",
            completed: "COMPLETED",
            deferred: "DEFERRED",
            canceled: "CANCELED",
            reviewing: "REVIEWING",
            todayDue: "TODAYDUE",
            overDue: "OVERDUE",
            init: "INIT",
            response: "RESPONSE",
            accepted: "ACCEPTED",
            reprocess: "REPROCESS",
            reopen: "REOPEN",
            solved: "SOLVED",
            evalution: "EVALUTION",
            approved: "APPROVED",
            rejected: "REJECTED",
        },
        ui: {
            "PENDING": {
                icon: "bx bx-pause"
            },
            "IN_PROGRESS": {
                icon: "bx bx-play"
            },
            "DEFERRED": {
                icon: "bx bx-stop"
            },
            "CANCELED": {
                icon: "bx bx-x"
            },
            "COMPLETED": {
                icon: "bx bx-check"
            },
            "REVIEWING": {
                icon: "bx bx-search-alt-2"
            },
            "REPROCESS": {
                icon: "bx bx-repeat"
            }
        },
        type: {
            service: 'SERVICE',
            task: 'TASK',
            approve: 'APPROVE',
            approve_half: 'APPROVE_HALF',
            approve_all: 'APPROVE_ALL',
            approve_one: 'APPROVE_ONE',
            approve_sequence: 'APPROVE_SEQUENCE'
        },
        approve: {
            empty: 'na',
            approved: 'true',
            rejected: 'false',
        }
    },
    request: {
        state: {
            canceled: 'CANCELED',
            pending: 'PENDING'
        }
    }
}

export default Enumeration;
