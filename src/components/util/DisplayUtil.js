import CommonFunction from '@lib/common';
import _ from "lodash";
import React from "react";
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';

const DisplayUtil = {

    /**
     * get task role with User
     * @param {*} obj
     * @param {*} path
     * @returns
     */
    displayChipUser(_user, isUsername, size){
        if(_user){
            let _label = _.cloneDeep(_user.fullName);
            if(!_label){
                _label = (_user.first_name || _user.firstName)
                    + ' ' + (_user.middle_name || _user.middleName)
                    + ' ' + (_user.last_name || _user.lastName)
            }
            if(isUsername){
                let _username = _user.username;
                if(_username){
                    _username = _.split(_username, '@')[0];
                    _label = _username;
                }
            }
            return (
                <XAvatar
                    src={CommonFunction.getImageUrl(_user.avatar, _user.fullName)}
                    label={() => _label}
                    size={size ? size : "18px"}
                ></XAvatar>

                // <Chip label={_label}
                //       image={CommonFunction.getImageUrl(_user.avatar, _user.fullName)}
                //       className="tiny text-ellipsis"></Chip>
            )
        }
    },

    displayTaskState(code,name) {
        let states = [
            {code: 'RESPONSE',      score: 2,   class:"bg-yellow-2",    style:{ borderRadius: '1rem',color:"white",minWidth:"65px"}},
            {code: 'INIT',          score: 1,   class:"bg-green-2",     style:{ borderRadius: '1rem',color:"white",minWidth:"65px"}},
            {code: 'IN_PROGRESS',   score: 3,   class:"bg-purple-3",    style:{ borderRadius: '1rem' ,color:"white",minWidth:"65px"}},
            {code: 'PENDING',       score: 4,   class:"bg-green-4",      style:{ borderRadius: '1rem',color:"white",minWidth:"65px"}},
            {code: 'CANCELED',      score: 5,   class:"bg-red-4",       style:{ borderRadius: '1rem' ,color:"white",minWidth:"65px"}},
            {code: 'SOLVED',        score: 6,   class:"bg-cyan-4",     style:{ borderRadius: '1rem' ,minWidth:"65px"}},
            {code: 'COMPLETED',     score: 7,   class:"bg-blue-4",      style:{ borderRadius: '1rem' ,color:"white",minWidth:"65px"}},
            {code: 'EVALUTION',     score: 8,   class:"bg-brown-3",        style:{ borderRadius: '1rem' ,minWidth:"65px"}},
            {code: 'ACCEPTED',      score: 9,   class:"bg-cyan-1",        style:{ borderRadius: '1rem' ,minWidth:"65px"}},
            {code: 'REVIEWING',     score: 10,  class:"bg-yellow-5",    style:{ borderRadius: '1rem',minWidth:"65px"}},
            {code: 'DEFERRED',      score: 11,  class:"bg-red-1",    style:{ borderRadius: '1rem' ,minWidth:"65px"}},
            {code: 'REOPEN',        score: 12,  class:"bg-orange-1",      style:{ borderRadius: '1rem' ,minWidth:"65px"}},
            {code: 'REPROCESS',     score: 13,  class:"bg-orange-4",        style:{ borderRadius: '1rem' ,minWidth:"65px"}},
        ]

        let _index  = _.findIndex(states,{code:code});
        if(_index && _index > -1) {
            return (
                <>
                    <span style={states[_index].style}
                        className={`p-1 p-text-center ${states[_index].class}`}
                    >{name}</span>
                </>
            )
        }

    }
}

export default DisplayUtil;
