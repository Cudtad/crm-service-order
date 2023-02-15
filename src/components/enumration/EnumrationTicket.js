import Enumeration from '@lib/enum';
const EnumrationTicket = {
    ...Enumeration,
    ...
    {

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
    }
}
export default EnumrationTicket;