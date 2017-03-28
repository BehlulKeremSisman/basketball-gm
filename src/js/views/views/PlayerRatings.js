import React from 'react';
import g from '../../globals';
import bbgmViewReact from '../../util/bbgmViewReact';
import getCols from '../../util/getCols';
import * as helpers from '../../util/helpers';
import classNames from 'classnames';
import {DataTable, Dropdown, JumpTo, NewWindowLink, PlayerNameLabels} from '../components';

const PlayerRatings = ({abbrev, players, season}) => {
    bbgmViewReact.title(`Player Ratings - ${season}`);

    const cols = getCols('Name', 'Pos', 'Team', 'Age', 'Country', 'Ovr', 'Pot', 'rating:Hgt', 'rating:Str', 'rating:Spd', 'rating:Jmp', 'rating:End', 'rating:Ins', 'rating:Dnk', 'rating:FT', 'rating:2Pt', 'rating:3Pt', 'rating:Blk', 'rating:Stl', 'rating:Drb', 'rating:Pss', 'rating:Reb');


    const RatingWithChange = ({change, children}: {change: number, children: number}) => {
        return <span>
            {children}
            {change !== 0 ? <span
                className={classNames({'text-success': change > 0, 'text-danger': change < 0})}
            > ({change > 0 ? '+' : null}
                {change})
            </span> : null}
        </span>;
    };

    const rows = players.map(p => {
        return {
            key: p.pid,
            data: [
                <PlayerNameLabels
                    pid={p.pid}
                    injury={p.injury}
                    skills={p.ratings.skills}
                    watch={p.watch}
                >{p.name}</PlayerNameLabels>,
                p.ratings.pos,
                <a href={helpers.leagueUrl(["roster", p.stats.abbrev, season])}>{p.stats.abbrev}</a>,
                p.age - (g.season - season),
                p.born.loc,
                <RatingWithChange change={p.ratings.dovr}>{p.ratings.ovr}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dpot}>{p.ratings.pot}</RatingWithChange>,
                p.ratings.hgt,
                <RatingWithChange change={p.ratings.dstre}>{p.ratings.stre}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dspd}>{p.ratings.spd}</RatingWithChange>,
                <RatingWithChange change={p.ratings.djmp}>{p.ratings.jmp}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dendu}>{p.ratings.endu}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dins}>{p.ratings.ins}</RatingWithChange>,
                <RatingWithChange change={p.ratings.ddnk}>{p.ratings.dnk}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dft}>{p.ratings.ft}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dfg}>{p.ratings.fg}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dtp}>{p.ratings.tp}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dblk}>{p.ratings.blk}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dstl}>{p.ratings.stl}</RatingWithChange>,
                <RatingWithChange change={p.ratings.ddrb}>{p.ratings.drb}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dpss}>{p.ratings.pss}</RatingWithChange>,
                <RatingWithChange change={p.ratings.dreb}>{p.ratings.reb}</RatingWithChange>,
            ],
            classNames: {
                danger: p.hof,
                info: p.stats.tid === g.userTid,
            },
        };
    });

    return <div>
        <Dropdown view="player_ratings" fields={["teamsAndAllWatch", "seasons"]} values={[abbrev, season]} />
        <JumpTo season={season} />
        <h1>Player Ratings <NewWindowLink /></h1>

        <p>More: <a href={helpers.leagueUrl(['player_rating_dists', season])}>Rating Distributions</a></p>

        <p>Players on your team are <span className="text-info">highlighted in blue</span>. Players in the Hall of Fame are <span className="text-danger">highlighted in red</span>.</p>

        <DataTable
            cols={cols}
            defaultSort={[5, 'desc']}
            name="PlayerRatings"
            pagination
            rows={rows}
        />
    </div>;
};

PlayerRatings.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    players: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    season: React.PropTypes.number.isRequired,
};

export default PlayerRatings;
