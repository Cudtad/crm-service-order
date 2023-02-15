import CommonFunction from '@lib/common';

const TicketEnumeration = {
    type: {
        ticket: "TICKET",
        change: "CHANGE",
        problem: "PROBLEM",
        task: "TASK",
    },
    role: {
        requester: "REQUESTER",
        assignee: "ASSIGNEE",
        observer: "OBSERVER"
    },
    analysis: {
        impacts: "IMPACTS",
        causes: "CAUSES",
        symptoms: "SYMPTOMS",
        control: "CONTROL",
        solution: "SOLUTION"
    },
    state: {
        ticket: {
            init: "INIT",
            response: "RESPONSE",
            inProgress: "IN_PROGRESS",
            pending: "PENDING",
            canceled: "CANCELED",
            solved: "SOLVED",
            completed: "COMPLETED"
        },
        change: {
            init: "INIT",
            evaluation: "EVALUTION",
            accepted: "ACCEPTED",
            inProgress: "IN_PROGRESS",
            pending: "PENDING",
            solved: "SOLVED",
            completed: "COMPLETED",
            deferred: "DEFERRED"
        },
        problem: {
            init: "INIT",
            accepted: "ACCEPTED",
            inProgress: "IN_PROGRESS",
            pending: "PENDING",
            solved: "SOLVED",
            canceled: "CANCELED",
            completed: "COMPLETED"
        },
        task: {
            init: "INIT",
            inProgress: "IN_PROGRESS",
            pending: "PENDING",
            canceled: "CANCELED",
            completed: "COMPLETED"
        },
    },
    ui: {
        ticket: {
            icon: "bx bx-receipt",
            name: "ticket.ticket"
        },
        change: {
            icon: "bx bx-transfer-alt",
            name: "ticket.change"
        },
        problem: {
            icon: "bx bx-error-alt",
            name: "ticket.problem"
        },
        task: {
            icon: "bx bx-task",
            name: "ticket.task"
        }
    },
    dropdown: {
        tickettype: {
            options: [
                { id: 1, name: CommonFunction.t("ticket.ticket") },
                { id: 2, name: CommonFunction.t("ticket.problem") },
                { id: 3, name: CommonFunction.t("ticket.change") },
                { id: 4, name: CommonFunction.t("ticket.task") }
            ]
        },
        urgency: {
            options: [
                { id: 1, code: 'UNAFFECT',  name: CommonFunction.t("priority-unaffect") },
                { id: 2, code: 'VERY_LOW',  name: CommonFunction.t("priority-very-low") },
                { id: 3, code: 'LOW',       name: CommonFunction.t("priority-low") },
                { id: 4, code: 'MEDIUM',    name: CommonFunction.t("priority-medium") },
                { id: 5, code: 'HIGH',      name: CommonFunction.t("priority-high") },
                { id: 6, code: 'VERY_HIGH', name: CommonFunction.t("priority-very-high") },
                { id: 7, code: 'CRITICAL',  name: CommonFunction.t("priority-critical") },
            ]
        },
        impact: {
            options: [
                { id: 1, code: 'UNAFFECT',  name: CommonFunction.t("priority-unaffect") },
                { id: 2, code: 'VERY_LOW',  name: CommonFunction.t("priority-very-low") },
                { id: 3, code: 'LOW',       name: CommonFunction.t("priority-low") },
                { id: 4, code: 'MEDIUM',    name: CommonFunction.t("priority-medium") },
                { id: 5, code: 'HIGH',      name: CommonFunction.t("priority-high") },
                { id: 6, code: 'VERY_HIGH', name: CommonFunction.t("priority-very-high") },
                { id: 7, code: 'CRITICAL',  name: CommonFunction.t("priority-critical") },
            ]
        },
        priority: {
            options: [
                { id: 1, code: 'UNAFFECT',  name: CommonFunction.t("priority-unaffect") },
                { id: 2, code: 'VERY_LOW',  name: CommonFunction.t("priority-very-low") },
                { id: 3, code: 'LOW',       name: CommonFunction.t("priority-low") },
                { id: 4, code: 'MEDIUM',    name: CommonFunction.t("priority-medium") },
                { id: 5, code: 'HIGH',      name: CommonFunction.t("priority-high") },
                { id: 6, code: 'VERY_HIGH', name: CommonFunction.t("priority-very-high") },
                { id: 7, code: 'CRITICAL',  name: CommonFunction.t("priority-critical") },
            ]
        },
        subtype: {
            options: [
                { id: 1, value : "INCIDENT" , name: CommonFunction.t("ticket.incident") },
                { id: 2, value : "REQUEST" , name: CommonFunction.t("ticket.request") },
            ]
        },
        resource: {
            options: [
                { id: 1, value : "Phone" , name: CommonFunction.t("ticket.phone") },
                { id: 2, value : "Email" , name: CommonFunction.t("ticket.email") },
                { id: 3, value : "Other" , name: CommonFunction.t("ticket.other") },
                { id: 4, value : "Helpdesk" , name: CommonFunction.t("ticket.helpdesk") },
                { id: 5, value : "Direct" , name: CommonFunction.t("ticket.direct") },
            ]
        },
        state: {
            ticket: [
                    { id: "INIT",            name: CommonFunction.t("ticket.state.ticket.INIT") },
                    { id: "RESPONSE",       name: CommonFunction.t("ticket.state.ticket.RESPONSE") },
                    { id: "IN_PROGRESS",    name: CommonFunction.t("ticket.state.ticket.IN_PROGRESS") },
                    { id: "PENDING",        name: CommonFunction.t("ticket.state.ticket.PENDING") },
                    { id: "CANCELED",       name: CommonFunction.t("ticket.state.ticket.CANCELED") },
                    { id: "SOLVED",         name: CommonFunction.t("ticket.state.ticket.SOLVED") },
                    { id: "COMPLETED",      name: CommonFunction.t("ticket.state.ticket.COMPLETED") }
                ],
            problem: [
                    { id: "INIT",            name: CommonFunction.t("ticket.state.ticket.INIT") },
                    { id: "ACCEPTED",       name: CommonFunction.t("ticket.state.ticket.ACCEPTED") },
                    { id: "IN_PROGRESS",    name: CommonFunction.t("ticket.state.ticket.IN_PROGRESS") },
                    { id: "PENDING",        name: CommonFunction.t("ticket.state.ticket.PENDING") },
                    { id: "CANCELED",       name: CommonFunction.t("ticket.state.ticket.CANCELED") },
                    { id: "SOLVED",         name: CommonFunction.t("ticket.state.ticket.SOLVED") },
                    { id: "COMPLETED",      name: CommonFunction.t("ticket.state.ticket.COMPLETED") }
            ],
            change: [
                { id: "INIT",            name: CommonFunction.t("ticket.state.ticket.INIT") },
                { id: "ACCEPTED",       name: CommonFunction.t("ticket.state.ticket.ACCEPTED") },
                { id: "EVALUTION",      name: CommonFunction.t("ticket.state.ticket.EVALUTION") },
                { id: "IN_PROGRESS",    name: CommonFunction.t("ticket.state.ticket.IN_PROGRESS") },
                { id: "PENDING",        name: CommonFunction.t("ticket.state.ticket.PENDING") },
                { id: "CANCELED",       name: CommonFunction.t("ticket.state.ticket.CANCELED") },
                { id: "SOLVED",         name: CommonFunction.t("ticket.state.ticket.SOLVED") },
                { id: "COMPLETED",      name: CommonFunction.t("ticket.state.ticket.COMPLETED") }
            ],
            task: [
                { id: "INIT",            name: CommonFunction.t("ticket.state.ticket.INIT") },
                { id: "IN_PROGRESS",    name: CommonFunction.t("ticket.state.ticket.IN_PROGRESS") },
                { id: "PENDING",        name: CommonFunction.t("ticket.state.ticket.PENDING") },
                { id: "CANCELED",       name: CommonFunction.t("ticket.state.ticket.CANCELED") },
                { id: "COMPLETED",      name: CommonFunction.t("ticket.state.ticket.COMPLETED") }
            ]
        }
    }
}

export default TicketEnumeration;
