import _ from "lodash";


const MatrixUtil = {
    const_priority() {
        return [
            {
                code: 'CRITICAL',
                score: 7,
                color: "#f22515"
            },
            {
                code: 'VERY_HIGH',
                score: 6,
                color: "#f51515"
            },
            {
                code: 'HIGH',
                score: 5,
                color: "#c94831"
            },
            {
                code: 'MEDIUM',
                score: 4,
                color: "#ea821a"
            },
            {
                code: 'LOW',
                score: 3,
                color: "#f8ff76"

            },
            {
                code: 'VERY_LOW',
                score: 2,
                color: "#ffd15e"
            },
            {
                code: 'UNAFFECT',
                score: 1,
                color: "#fdd15e"
            }
        ];
    },

    getColorMatrix(code, colorMatrix) {
        let _find = _.find(colorMatrix, {'code': code});
        if(_find){
            return _find.color;
        }
        return "#f8ff76";
    },

    getSeverityByScore(score, colorMatrix){
        if(score < 4){
            return {code: 'UNAFFECT', color: MatrixUtil.getColorMatrix('UNAFFECT', colorMatrix)};
        }
        if(score < 8){
            return {code: 'VERY_LOW',  color: MatrixUtil.getColorMatrix('VERY_LOW', colorMatrix)};
        }
        if(score < 15){
            return {code: 'LOW',  color: MatrixUtil.getColorMatrix('LOW', colorMatrix)};
        }
        if(score < 20) {
            return {code: 'MEDIUM', color: MatrixUtil.getColorMatrix('MEDIUM', colorMatrix)};
        }
        if(score < 29) {
            return {code: 'HIGH', color: MatrixUtil.getColorMatrix('HIGH', colorMatrix)};
        }
        if(score < 36) {
            return {code: 'VERY_HIGH', color: MatrixUtil.getColorMatrix('VERY_HIGH', colorMatrix)};
        }
        return {code: 'CRITICAL', color: MatrixUtil.getColorMatrix('CRITICAL', colorMatrix)};
    },

    buildDefaultSeverityMatrix (colorMatrix)  {
        let _data = []
        MatrixUtil.const_priority().forEach(function (happen, happenIndex){
            MatrixUtil.const_priority().forEach(function (impact, impactIndex){
                let _severityObject = MatrixUtil.getSeverityByScore(happen.score * impact.score, colorMatrix)
                let _item = {
                    happen: happen.code,
                    impact: impact.code,
                    severity: _severityObject
                }
                _data.push(_item)
            })
        })
        return _data;
    },

}
export default MatrixUtil;
