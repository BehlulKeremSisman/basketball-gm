import g from '../globals';
import * as player from '../core/player';
import bbgmViewReact from '../util/bbgmViewReact';
import * as helpers from '../util/helpers';
import PlayerRatings from './views/PlayerRatings';

function get(ctx) {
    let abbrev;
    if (g.teamAbbrevsCache.includes(ctx.params.abbrev)) {
        abbrev = ctx.params.abbrev;
    } else if (ctx.params.abbrev && ctx.params.abbrev === 'watch') {
        abbrev = "watch";
    } else {
        abbrev = "all";
    }

    return {
        abbrev,
        season: helpers.validateSeason(ctx.params.season),
    };
}

async function updatePlayers(inputs, updateEvents, state) {
    if (updateEvents.includes('dbChange') || (inputs.season === g.season && updateEvents.includes('playerMovement')) || (updateEvents.includes('newPhase') && g.phase === g.PHASE.PRESEASON) || inputs.season !== state.season || inputs.abbrev !== state.abbrev) {
        let players = await g.dbl.players.getAll();
        players = await player.withStats(null, players, {
            statsSeasons: [inputs.season],
        });

        let tid = g.teamAbbrevsCache.indexOf(inputs.abbrev);
        if (tid < 0) { tid = undefined; } // Show all teams

        if (!tid && inputs.abbrev === "watch") {
            players = players.filter(p => p.watch && typeof p.watch !== "function");
        }

        const attrs = ["pid", "name", "abbrev", "age", "born", "injury", "watch", "hof"];  // tid and draft are used for checking if a player can be released without paying his salary
        const ratings = ["ovr", "pot", "hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb", "dovr", "dpot", "dhgt", "dstre", "dspd", "djmp", "dendu", "dins", "ddnk", "dft", "dfg", "dtp", "dblk", "dstl", "ddrb", "dpss", "dreb", "skills", "pos"];
        const stats = ["abbrev", "tid"];

        players = player.filter(players, {
            attrs,
            ratings,
            stats,
            season: inputs.season,
            tid: inputs.tid,
            showNoStats: true,
            showRookies: true,
            fuzz: true,
        });


        // player.filter TID option doesn't work well enough (factoring in showNoStats and showRookies), so let's do it manually
        // For the current season, use the current abbrev (including FA), not the last stats abbrev
        // For other seasons, use the stats abbrev for filtering
        if (g.season === inputs.season) {
            if (tid !== undefined) {
                players = players.filter(p => p.abbrev === inputs.abbrev);
            }

            for (let i = 0; i < players.length; i++) {
                players[i].stats.abbrev = players[i].abbrev;
            }
        } else if (tid !== undefined) {
            players = players.filter(p => p.stats.abbrev === inputs.abbrev);
        }

        return {
            abbrev: inputs.abbrev,
            season: inputs.season,
            players,
        };
    }
}

export default bbgmViewReact.init({
    id: "playerRatings",
    get,
    runBefore: [updatePlayers],
    Component: PlayerRatings,
});
