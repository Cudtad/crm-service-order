export const MODE = {
    CREATE: 'create',
    UPDATE: 'update'
}

export const ACCOUNT_OBJECT = {
    CONTACT: 1,
    ACCOUNT: 2
}

export const TASK_OBJECT_TYPE = {
    CONTACT_OBJECT: 1,
    ACCOUNT_OBJECT: 2,
    LEAD_OBJECT: 3,
    OPP_OBJECT: 4,
    QUOTE_OBJECT: 5,
    CONTRACT_OBJECT: 6,
    ORDER_OBJECT: 7,
    SERVICE_ORDER_OBJECT: 10,
}

export const TASK_OBJECT_TYPE_NAME = {
    SERVICE_ORDER_OBJECT: "SERVICE_ORDER_OBJECT"
}

export const ACTIVITY_TYPE = {
    TASK_OBJECT: 1,
    PHONE_CALL_OBJECT: 2,
    EMAIL_OBJECT: 3,
    APPOINTMENT_OBJECT: 4,
}

export const ACTIVITY_PATH = {
    '/crm/crm/sale-task': {
        type: ACTIVITY_TYPE.TASK_OBJECT,
        permissionCode: 'crm-service_sale-management_sale-activity_task'
    },
    '/crm/crm/sale-phone-call': {
        type: ACTIVITY_TYPE.PHONE_CALL_OBJECT,
        permissionCode: 'crm-service_sale-management_sale-activity_phone-call'
    },
    '/crm/crm/sale-email': {
        type: ACTIVITY_TYPE.EMAIL_OBJECT,
        permissionCode: 'crm-service_sale-management_sale-activity_email'
    },
    '/crm/crm/sale-appointment': {
        type: ACTIVITY_TYPE.APPOINTMENT_OBJECT,
        permissionCode: 'crm-service_sale-management_sale-activity_appointment'
    }
}

export const ACTIVITY_LIST = [
    {
        id: ACTIVITY_TYPE.TASK_OBJECT,
        name: 'crm.task-base.acctivity-type.task'
    },
    {
        id: ACTIVITY_TYPE.PHONE_CALL_OBJECT,
        name: 'crm.task-base.acctivity-type.phone-call'
    },
    {
        id: ACTIVITY_TYPE.EMAIL_OBJECT,
        name: 'crm.task-base.acctivity-type.email'
    },
    {
        id: ACTIVITY_TYPE.APPOINTMENT_OBJECT,
        name: 'crm.task-base.acctivity-type.appointment'
    }
]

export const REGEX_LETTER = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀẾỂưăạảấầẩẫậắằẳẵặẹẻẽềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ ]+$/
export const REGEX_NAME = /^[a-z0-9A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀẾỂưăạảấầẩẫậắằẳẵặẹẻẽềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ ]+$/
export const REGEX_NAME_SPECIAL = /^[(),.\-_&a-z0-9A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀẾỂưăạảấầẩẫậắằẳẵặẹẻẽềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ ]+$/
export const REGEX_ACCOUNT_NAME = /^[-()&_+:.,a-z0-9A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀẾỂưăạảấầẩẫậắằẳẵặẹẻẽềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ ]+$/
export const REGEX_CODE = /^[a-z0-9A-Z_-]+$/

export const REGEX_PHONE = /^[1]+(\d{7,10})$|^[0]+(\d{9,10})$/

export const REGEX_PHONE_1 = /^[+]+[0]+(\d{8,15})$/

export const REGEX_NUMBER = /^[0-9]+$/

export const REGEX_PASSPORT =/^\w{8,9}$/

export const REGEX_TAX_CODE =/^(\d{10})+[-]+(\d{3})+$|^(\d{10})$/

export const REGEX_D_W = /^[a-zA-Z0-9- ]*$/

export const REGEX_EMAIL = /^[\w-\.]+@([\w-]+\.)+[\w-]+$/

// export const REGEX_RATE = /^\d*\.?\d*$/

export const REGEX_FLOAT = /^\d*\.?\d*$/

export const REGEX_INT = /^[\d]+$/

export const PREVIEW_NUMBER = 2

export const IGNORE_PERMISSION = [
    'crm-service_sale-management_price-quote_item', // Quote
    'crm-service_sale-management_price-quote_party-involved',
    'crm-service_sale-management_sale-lead_party-involved', // Lead
    'crm-service_sale-management-contract_party-involved', // Contract
    'crm-service_customer-management_party-involved', //Account
    'crm-service_customer-management_related-contact',
    "crm-service_customer-management_related-lead",
    "crm-service_customer-management_related-opp",
    "crm-service_customer-management_related-quote",
    "crm-service_customer-management_related-contract",
    "crm-service_customer-management_related-order",
    'crm-service_sale-management_sale-opporturnity_item', // Opp
    'crm-service_sale-management_sale-opporturnity_related-quote',
    'crm-service_sale-management_sale-opporturnity_party-involved',
    'crm-service_sale-management-sale-order_item', // Order
    'crm-service_sale-management-sale-order_party-involved',
]

export const ICON_MODULE_CRM = {
    ACCOUNT: {
        icon: 'bx bx-buildings',
        bg: 'crm-header-bg-customer'
    },
    CONTRACT: {
        icon: 'bx bx-copy-alt',
        bg: 'crm-header-bg-contract'
    },
    CONTACT: {
        icon: 'bx bx-id-card',
        bg: 'crm-header-bg-contact'
    },
    LEAD: {
        icon: 'bx bx-group',
        bg: 'bg-orange-500'
    },
    QUOTE: {
        icon: 'bx bx-purchase-tag',
        bg: 'crm-header-bg-quote'
    },
    OPP: {
        icon: 'bx bx-crown',
        bg: 'crm-header-bg-opp'
    },
    ORDER: {
        icon: 'bx bx-package',
        bg: 'crm-header-bg-order'
    },
    INVOICE: {
        icon: 'bx bx-group',
        bg: 'bg-blue-500'
    },
    Path: {
        icon: 'bx bx-compass',
        bg: 'crm-header-bg-path'
    },
    MATERIAL_TYPE: {
        icon: 'bx bx-cube',
        bg: 'crm-header-bg-material-type'
    },
    SERVICE_ORDER: {
        icon: 'bx bx-check-shield',
        bg: 'crm-header-bg-service-order'
    },
}
