define(["globals", "lib/bluebird"], function (g, Promise) {
    "use strict";

    /**
     * Get the total current payroll for a team.
     * 
     * This includes players who have been released but are still owed money from their old contracts.
     * 
     * @memberOf dao.payrolls
     * @param {IDBTransaction|null} ot An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @param {Promise.<number, Array=>} cb Array; first argument is the payroll in thousands of dollars, second argument is the array of contract objects from dao.contracts.getAll.
     */
    function get(options) {
        options = options !== undefined ? options : {};
        options.ot = options.ot !== undefined ? options.ot : null;
        options.tid = options.tid !== undefined ? options.tid : null;

        if (options.tid === null) {
            throw new Error("Need to supply a tid to dao.payrolls.getAll");
        }

        return require("dao/contracts").getAll({ot: options.ot, tid: options.tid}).then(function (contracts) {
            var i, payroll;

            payroll = 0;
            for (i = 0; i < contracts.length; i++) {
                payroll += contracts[i].amount;  // No need to check exp, since anyone without a contract for the current season will not have an entry
            }

            return [payroll, contracts];
        });
    }

    /**
     * Get the total current payroll for every team team.
     * 
     * @memberOf dao.payrolls
     * @param {Promise} cb Resolves to an array of payrolls, ordered by team id.
     */
    function getAll() {
        var getPayroll, i, promises, tx;

        tx = g.dbl.transaction(["players", "releasedPlayers"]);

        getPayroll = function (tx, tid) {
            return get({ot: tx, tid: tid});
        };

        promises = [];
        for (i = 0; i < g.numTeams; i++) {
            promises.push(getPayroll(tx, i));
        }

        return Promise.all(promises);
    }

    return {
        get: get,
        getAll: getAll
    };
});