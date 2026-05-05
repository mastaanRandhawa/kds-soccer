# Soccer Match Display Guide

## 1. Core Features Needed

Your soccer system should support three main views:

### A. Match Table View

Used for fixtures and results.

Example:

| Date   |    Time | Home   | Score | Away   | Venue      | Status    |
| ------ | ------: | ------ | ----: | ------ | ---------- | --------- |
| May 10 | 3:00 PM | Team A | 2 - 1 | Team B | Main Field | Finished  |
| May 12 | 6:00 PM | Team C |    vs | Team D | Stadium 2  | Scheduled |

This is useful for:

* Upcoming matches
* Past results
* Filtering by team, league, round, date, or status
* Showing scores once the match is complete

---

### B. League Table / Standings View

Used for round-robin leagues where teams collect points.

Example:

| Pos | Team   |  P |  W |  D |  L | GF | GA |  GD | Pts | Form      |
| --: | ------ | -: | -: | -: | -: | -: | -: | --: | --: | --------- |
|   1 | Team A | 10 |  7 |  2 |  1 | 22 |  9 | +13 |  23 | W W D W L |
|   2 | Team B | 10 |  6 |  3 |  1 | 18 |  8 | +10 |  21 | W D W W D |

The league table should calculate:

* **P** = matches played
* **W** = wins
* **D** = draws
* **L** = losses
* **GF** = goals for
* **GA** = goals against
* **GD** = goal difference
* **Pts** = points
* **Form** = last 5 results

Standard football scoring is:

```text
Win  = 3 points
Draw = 1 point
Loss = 0 points
```

For ranking, most leagues sort by:

```text
1. Points
2. Goal difference
3. Goals scored
4. Wins
5. Head-to-head, if needed
```

UEFA’s Champions League league phase also uses a single large table and separates teams by qualification outcome, such as top teams going directly to the Round of 16 and lower-ranked teams entering playoff zones. ([UEFA.com][2])

---

### C. Knockout Stage / Bracket View

Used for tournaments like Champions League knockout rounds, playoffs, semifinals, and finals.

Example:

```text
Quarter Final              Semi Final               Final

Team A ─────┐
            ├── Team A ───┐
Team B ─────┘             │
                          ├── Team A
Team C ─────┐             │
            ├── Team D ───┘
Team D ─────┘
```

The knockout bracket should support:

* Round of 16
* Quarter-finals
* Semi-finals
* Final
* Third-place match, optional
* Two-legged ties, optional
* Aggregate score, optional
* Penalties, optional
* Automatic winner advancement

UEFA has a dedicated bracket view for Champions League fixtures/results, which is a good model to follow for separating knockout visualization from the regular standings table. ([UEFA.com][3])

---

# 2. Recommended Pages

## Public User Pages

### `/matches`

Shows all matches in table/list format.

Filters:

* Competition
* Season
* Team
* Round
* Date
* Status: Scheduled, Live, Finished, Postponed

---

### `/standings`

Shows league table.

Features:

* Team position
* Stats columns
* Qualification zones
* Form
* Home/away split, optional
* Click team to view team page

---

### `/knockout`

Shows bracket format.

Features:

* Round columns
* Match cards
* Aggregate scores
* Winner highlighted
* Admin-added matches appear automatically
* Empty slots show “TBD”

---

### `/teams/:id`

Shows team-specific data.

Include:

* Team name
* Logo
* Squad, optional
* Upcoming matches
* Past results
* League position
* Goals scored/conceded

---

## Admin Pages

### `/admin/matches`

Admin can:

* Add a league match
* Add a knockout match
* Edit score
* Change status
* Assign teams
* Assign round
* Assign venue
* Mark winner
* Enter penalties
* Enter aggregate score if needed

---

### `/admin/knockout`

Admin can:

* Create bracket
* Add teams to bracket slots
* Add matches to specific rounds
* Move winners forward
* Edit knockout match result
* Set match as single-leg or two-leg
* Lock completed rounds

---

### `/admin/standings`

Usually this should be auto-generated from match results.

Admin should not manually edit standings unless you need an override system.

Possible admin actions:

* Recalculate table
* Apply points deduction
* Adjust team position manually, optional
* Add disciplinary penalty, optional

---

# 3. Database Design

## Main Tables

You should have these main entities:

```text
Competition
Season
Team
Match
Standing
KnockoutRound
KnockoutTie
KnockoutMatch
Venue
```

---

## Competition Table

Stores the tournament or league.

```ts
Competition {
  id: string;
  name: string; // "La Liga", "Champions League", "Church Soccer League"
  type: "LEAGUE" | "KNOCKOUT" | "LEAGUE_AND_KNOCKOUT";
  logoUrl?: string;
}
```

Use `LEAGUE_AND_KNOCKOUT` for competitions that have both a league/group phase and knockout stage.

Example:

```text
UEFA Champions League = LEAGUE_AND_KNOCKOUT
LaLiga = LEAGUE
World Cup = LEAGUE_AND_KNOCKOUT
FA Cup = KNOCKOUT
```

---

## Season Table

```ts
Season {
  id: string;
  competitionId: string;
  name: string; // "2025/26"
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
```

---

## Team Table

```ts
Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  primaryColor?: string;
}
```

---

## Match Table

Use this for all matches, both league and knockout.

```ts
Match {
  id: string;

  competitionId: string;
  seasonId: string;

  homeTeamId: string;
  awayTeamId: string;

  homeScore?: number;
  awayScore?: number;

  homePenaltyScore?: number;
  awayPenaltyScore?: number;

  matchDate: Date;
  venue?: string;

  roundName?: string; 
  // Example: "Matchday 1", "Quarter-final", "Semi-final", "Final"

  stage: "LEAGUE" | "GROUP" | "KNOCKOUT";

  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";

  winnerTeamId?: string;

  leg?: "SINGLE" | "FIRST_LEG" | "SECOND_LEG";

  createdAt: Date;
  updatedAt: Date;
}
```

---

## Standing Table

You can either store standings or calculate them dynamically.

For small projects, calculate dynamically from matches.

For larger projects, store standings for faster loading.

```ts
Standing {
  id: string;

  competitionId: string;
  seasonId: string;
  teamId: string;

  played: number;
  won: number;
  drawn: number;
  lost: number;

  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;

  points: number;

  position: number;

  form: string; // Example: "WWDLW"

  pointsDeduction?: number;
}
```

---

## Knockout Round Table

```ts
KnockoutRound {
  id: string;
  competitionId: string;
  seasonId: string;

  name: string; 
  // "Round of 16", "Quarter-final", "Semi-final", "Final"

  order: number;
  // Round of 16 = 1
  // Quarter-final = 2
  // Semi-final = 3
  // Final = 4
}
```

---

## Knockout Tie Table

A tie represents one matchup in the bracket.

For example:

```text
Quarter-final Tie 1:
Team A vs Team B
```

A tie may contain:

* One match for single-leg knockout
* Two matches for two-legged knockout

```ts
KnockoutTie {
  id: string;

  competitionId: string;
  seasonId: string;
  roundId: string;

  bracketPosition: number;
  // Example: 1, 2, 3, 4

  homeTeamId?: string;
  awayTeamId?: string;

  winnerTeamId?: string;

  nextTieId?: string;
  nextTieSlot?: "HOME" | "AWAY";

  status: "PENDING" | "SCHEDULED" | "FINISHED";
}
```

---

## Knockout Match Table

This connects matches to a knockout tie.

```ts
KnockoutMatch {
  id: string;
  tieId: string;
  matchId: string;
  leg: "SINGLE" | "FIRST_LEG" | "SECOND_LEG";
}
```

This is useful because a knockout tie can have multiple matches.

Example:

```text
Tie: Arsenal vs Real Madrid

Match 1: Arsenal 2 - 1 Real Madrid
Match 2: Real Madrid 1 - 1 Arsenal

Aggregate: Arsenal 3 - 2 Real Madrid
Winner: Arsenal
```

---

# 4. League Table Calculation Logic

When a league match is marked as `FINISHED`, update or recalculate standings.

## For Each Finished League Match

Example:

```text
Team A 2 - 1 Team B
```

Team A gets:

```text
Played +1
Won +1
Goals For +2
Goals Against +1
Goal Difference +1
Points +3
Form: W
```

Team B gets:

```text
Played +1
Lost +1
Goals For +1
Goals Against +2
Goal Difference -1
Points +0
Form: L
```

---

## Draw Example

```text
Team A 1 - 1 Team B
```

Both teams get:

```text
Played +1
Drawn +1
Goals For +1
Goals Against +1
Goal Difference 0
Points +1
Form: D
```

---

## TypeScript Example

```ts
function getMatchResult(
  homeScore: number,
  awayScore: number
): {
  homeResult: "W" | "D" | "L";
  awayResult: "W" | "D" | "L";
  homePoints: number;
  awayPoints: number;
} {
  if (homeScore > awayScore) {
    return {
      homeResult: "W",
      awayResult: "L",
      homePoints: 3,
      awayPoints: 0,
    };
  }

  if (homeScore < awayScore) {
    return {
      homeResult: "L",
      awayResult: "W",
      homePoints: 0,
      awayPoints: 3,
    };
  }

  return {
    homeResult: "D",
    awayResult: "D",
    homePoints: 1,
    awayPoints: 1,
  };
}
```

---

## Sorting the League Table

```ts
standings.sort((a, b) => {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    b.won - a.won ||
    a.teamName.localeCompare(b.teamName)
  );
});
```

---

# 5. League Table Columns

Your league table should include these columns:

| Column | Meaning            |
| ------ | ------------------ |
| Pos    | Current position   |
| Club   | Team name and logo |
| P      | Matches played     |
| W      | Wins               |
| D      | Draws              |
| L      | Losses             |
| GF     | Goals scored       |
| GA     | Goals conceded     |
| GD     | Goal difference    |
| Pts    | Total points       |
| Form   | Last 5 results     |

Optional advanced columns:

| Column        | Meaning                              |
| ------------- | ------------------------------------ |
| Home Pts      | Points earned at home                |
| Away Pts      | Points earned away                   |
| Clean Sheets  | Matches with 0 goals conceded        |
| Yellow Cards  | Discipline tracking                  |
| Red Cards     | Discipline tracking                  |
| Qualification | Champions, playoff, relegation, etc. |

---

# 6. Qualification Zones

Like UEFA’s table, you can visually separate rows by outcome. UEFA’s Champions League standings show zones such as direct Round of 16 qualification, seeded playoff places, unseeded playoff places, and eliminated teams. ([UEFA.com][2])

Example:

```ts
function getQualificationZone(position: number) {
  if (position <= 4) return "Champions";
  if (position <= 8) return "Playoff";
  if (position >= 18) return "Relegation";
  return "Normal";
}
```

For a Champions League-style format:

```ts
function getUefaStyleZone(position: number) {
  if (position <= 8) return "Straight to Round of 16";
  if (position <= 16) return "Knockout Playoff - Seeded";
  if (position <= 24) return "Knockout Playoff - Unseeded";
  return "Eliminated";
}
```

---

# 7. Match Table Design

## Public Match Table

Use a table for desktop:

| Date   | Match            | Score | Stage      | Venue   | Status    |
| ------ | ---------------- | ----: | ---------- | ------- | --------- |
| May 10 | Team A vs Team B | 2 - 1 | Matchday 4 | Field 1 | Finished  |
| May 12 | Team C vs Team D |     - | Semi-final | Field 2 | Scheduled |

On mobile, use cards:

```text
Team A        2
Team B        1
Finished · Matchday 4 · Field 1
```

---

## Match Status Rules

```ts
type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "HALF_TIME"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";
```

Display rules:

```text
SCHEDULED  -> Show date and time
LIVE       -> Show live minute and score
FINISHED   -> Show final score
POSTPONED  -> Show postponed label
CANCELLED  -> Show cancelled label
```

---

# 8. Knockout Bracket Design

## Basic Bracket Structure

Your bracket should be displayed as columns.

Example:

```text
Round of 16 | Quarter-final | Semi-final | Final
```

Each column contains match cards.

Example card:

```text
Quarter-final

Team A        2
Team B        1

Winner: Team A
```

For two-legged ties:

```text
Quarter-final

Team A     2   1   3
Team B     1   1   2

Agg: Team A 3 - 2 Team B
Winner: Team A
```

---

## Knockout Tie Display Fields

Each knockout card should show:

```text
Round name
Home team
Away team
First-leg score, if applicable
Second-leg score, if applicable
Aggregate score, if applicable
Penalty score, if applicable
Winner
Match date
Venue
Status
```

---

## Single-Leg Knockout Example

```json
{
  "roundName": "Semi-final",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "homeScore": 2,
  "awayScore": 1,
  "winner": "Team A",
  "status": "FINISHED"
}
```

---

## Two-Leg Knockout Example

```json
{
  "roundName": "Quarter-final",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "firstLeg": {
    "homeTeam": "Team A",
    "awayTeam": "Team B",
    "homeScore": 2,
    "awayScore": 1
  },
  "secondLeg": {
    "homeTeam": "Team B",
    "awayTeam": "Team A",
    "homeScore": 1,
    "awayScore": 1
  },
  "aggregate": {
    "teamA": 3,
    "teamB": 2
  },
  "winner": "Team A"
}
```

---

# 9. Admin: Adding Matches to Knockout Table

The admin should be able to do this flow:

## Step 1: Create Knockout Round

Admin selects:

```text
Round name: Quarter-final
Number of ties: 4
Leg type: Single-leg or Two-leg
```

---

## Step 2: Add Teams to Tie

Admin selects:

```text
Tie 1:
Home team: Team A
Away team: Team B
Bracket position: 1
Next tie: Semi-final Tie 1
Next slot: HOME
```

---

## Step 3: Add Match Details

Admin enters:

```text
Date
Time
Venue
Home team
Away team
Leg type
```

---

## Step 4: Enter Result

Admin enters:

```text
Home score
Away score
Penalty score, optional
Winner
Status = Finished
```

---

## Step 5: Auto-Advance Winner

Once the tie is finished:

```text
Winner moves to the next tie
```

Example:

```text
Quarter-final Tie 1 winner -> Semi-final Tie 1 HOME slot
Quarter-final Tie 2 winner -> Semi-final Tie 1 AWAY slot
```

---

# 10. Knockout Advancement Logic

## Single Match Winner

```ts
function determineSingleMatchWinner(match: Match): string | null {
  if (match.homeScore == null || match.awayScore == null) return null;

  if (match.homeScore > match.awayScore) return match.homeTeamId;
  if (match.awayScore > match.homeScore) return match.awayTeamId;

  if (
    match.homePenaltyScore != null &&
    match.awayPenaltyScore != null
  ) {
    return match.homePenaltyScore > match.awayPenaltyScore
      ? match.homeTeamId
      : match.awayTeamId;
  }

  return null;
}
```

---

## Two-Leg Aggregate Winner

```ts
function determineAggregateWinner(
  firstLeg: Match,
  secondLeg: Match,
  teamAId: string,
  teamBId: string
): string | null {
  let teamAGoals = 0;
  let teamBGoals = 0;

  for (const match of [firstLeg, secondLeg]) {
    if (match.homeScore == null || match.awayScore == null) {
      return null;
    }

    if (match.homeTeamId === teamAId) {
      teamAGoals += match.homeScore;
      teamBGoals += match.awayScore;
    } else {
      teamAGoals += match.awayScore;
      teamBGoals += match.homeScore;
    }
  }

  if (teamAGoals > teamBGoals) return teamAId;
  if (teamBGoals > teamAGoals) return teamBId;

  // If aggregate is tied, use penalties from second leg
  if (
    secondLeg.homePenaltyScore != null &&
    secondLeg.awayPenaltyScore != null
  ) {
    return secondLeg.homePenaltyScore > secondLeg.awayPenaltyScore
      ? secondLeg.homeTeamId
      : secondLeg.awayTeamId;
  }

  return null;
}
```

---

# 11. Admin Form Fields

## Add League Match Form

```text
Competition
Season
Stage = League
Matchday
Home Team
Away Team
Date
Time
Venue
Status
```

Optional result fields:

```text
Home Score
Away Score
Yellow Cards
Red Cards
Possession
Shots
Shots on Target
```

---

## Add Knockout Match Form

```text
Competition
Season
Stage = Knockout
Round
Tie
Leg Type
Home Team
Away Team
Date
Time
Venue
Status
```

If result is finished:

```text
Home Score
Away Score
Penalty Score, optional
Winner
Advance winner automatically? Yes/No
```

---

# 12. Recommended API Endpoints

## Public APIs

```http
GET /api/competitions
GET /api/competitions/:competitionId/seasons
GET /api/seasons/:seasonId/matches
GET /api/seasons/:seasonId/standings
GET /api/seasons/:seasonId/knockout
GET /api/teams/:teamId/matches
```

---

## Admin APIs

```http
POST /api/admin/matches
PATCH /api/admin/matches/:matchId
DELETE /api/admin/matches/:matchId

POST /api/admin/knockout/rounds
POST /api/admin/knockout/ties
PATCH /api/admin/knockout/ties/:tieId

POST /api/admin/standings/recalculate
```

---

# 13. Example API Response: League Standings

```json
{
  "competition": "Premier League",
  "season": "2025/26",
  "standings": [
    {
      "position": 1,
      "team": {
        "id": "team_1",
        "name": "Team A",
        "logoUrl": "/logos/team-a.png"
      },
      "played": 10,
      "won": 7,
      "drawn": 2,
      "lost": 1,
      "goalsFor": 22,
      "goalsAgainst": 9,
      "goalDifference": 13,
      "points": 23,
      "form": ["W", "W", "D", "W", "L"],
      "zone": "Champions"
    }
  ]
}
```

---

# 14. Example API Response: Knockout Bracket

```json
{
  "competition": "Champions Cup",
  "season": "2025/26",
  "rounds": [
    {
      "id": "round_qf",
      "name": "Quarter-final",
      "order": 1,
      "ties": [
        {
          "id": "tie_1",
          "bracketPosition": 1,
          "homeTeam": {
            "id": "team_a",
            "name": "Team A"
          },
          "awayTeam": {
            "id": "team_b",
            "name": "Team B"
          },
          "aggregateHomeScore": 3,
          "aggregateAwayScore": 2,
          "winnerTeamId": "team_a",
          "nextTieId": "tie_5",
          "nextTieSlot": "HOME",
          "matches": [
            {
              "id": "match_1",
              "leg": "FIRST_LEG",
              "homeScore": 2,
              "awayScore": 1,
              "status": "FINISHED"
            },
            {
              "id": "match_2",
              "leg": "SECOND_LEG",
              "homeScore": 1,
              "awayScore": 1,
              "status": "FINISHED"
            }
          ]
        }
      ]
    }
  ]
}
```

---

# 15. Frontend Component Structure

For React, I would organize it like this:

```text
components/
  matches/
    MatchTable.tsx
    MatchCard.tsx
    MatchFilters.tsx

  standings/
    LeagueTable.tsx
    StandingsRow.tsx
    FormBadge.tsx
    QualificationLegend.tsx

  knockout/
    KnockoutBracket.tsx
    KnockoutRoundColumn.tsx
    KnockoutTieCard.tsx
    KnockoutConnector.tsx

  admin/
    MatchForm.tsx
    KnockoutTieForm.tsx
    ScoreUpdateForm.tsx
```

---

# 16. League Table UI Design

## Desktop

```text
Pos | Club | P | W | D | L | GF | GA | GD | Pts | Form
```

Keep the most important columns visible:

```text
Club
Played
Goal Difference
Points
```

## Mobile

Use cards instead of a full table:

```text
1. Team A
23 pts · 10 played · +13 GD
Form: W W D W L
```

---

# 17. Knockout UI Design

Each round should be a vertical column.

```text
[Round of 16] [Quarter-final] [Semi-final] [Final]
```

Each tie card:

```text
Team A     2
Team B     1
Finished
```

For empty future rounds:

```text
Winner Tie 1
vs
Winner Tie 2
```

This makes the bracket useful even before all teams are known.

---

# 18. Admin UX Rules

## Important Rules

The admin should not have to manually update everything.

When an admin enters a finished score:

```text
1. Save match result
2. Update league table if stage = LEAGUE
3. Determine knockout winner if stage = KNOCKOUT
4. Move winner to next bracket slot
5. Refresh public display
```

---

## Admin Validation

Before saving a match:

```text
Home team and away team cannot be the same
Score is required if status is FINISHED
Winner is required if knockout match is tied after penalties
Match date cannot be empty
Competition and season are required
Knockout match must belong to a round/tie
League match must belong to a matchday
```

---

# 19. Best Practical Approach

For your project, I recommend this order:

## Phase 1: Basic Match Table

Build:

```text
Teams
Competitions
Seasons
Matches
Public match table
Admin add/edit match
```

---

## Phase 2: League Standings

Add:

```text
Automatic standings calculation
Goals for
Goals against
Goal difference
Points
Form
Qualification zones
```

---

## Phase 3: Knockout Bracket

Add:

```text
Knockout rounds
Knockout ties
Bracket positions
Winner advancement
Admin knockout editor
```

---

## Phase 4: Advanced Stats

Add:

```text
Player goals
Assists
Yellow cards
Red cards
Clean sheets
Top scorers
Team form
Home/away tables
```

LaLiga’s site has separate leader/stat sections for goals, shots, passes, and assists, which is a good future model once the basic match and standings system is working. ([Página web oficial de LALIGA | LALIGA][1])

---

# 20. Suggested Final Data Model Summary

Minimum required models:

```text
Competition
Season
Team
Match
Standing
KnockoutRound
KnockoutTie
KnockoutMatch
```

Optional later models:

```text
Player
PlayerStat
TeamStat
MatchEvent
Venue
Referee
Card
Goal
Substitution
```

---

# 21. Simple Admin Flow Example

Admin adds a knockout match:

```text
Competition: Champions Cup
Season: 2025/26
Stage: Knockout
Round: Semi-final
Tie: Semi-final 1
Home Team: Team A
Away Team: Team B
Date: May 10
Venue: Main Stadium
Status: Scheduled
```

Later, admin updates score:

```text
Home Score: 2
Away Score: 1
Status: Finished
Winner: Team A
Advance winner: Yes
```

System automatically updates:

```text
Semi-final winner = Team A
Final slot = Team A
Public bracket updates
```

---

# 22. Final Recommendation

Use **one main Match table** for all games, then connect knockout games to a **KnockoutTie** when needed. Do not create completely separate systems for league matches and knockout matches. That will make your app harder to maintain.

Best structure:

```text
Match = actual game
Standing = calculated from league matches
KnockoutTie = bracket matchup
KnockoutMatch = link between tie and one or two actual matches
```

This gives you flexibility for:

```text
League-only competitions
Knockout-only competitions
Group + knockout competitions
Two-legged ties
Finals
Penalty shootouts
Admin-controlled brackets
Automatic standings
Automatic winner advancement
```

[1]: https://www.laliga.com/en-GB/leaderboard?utm_source=chatgpt.com "Leaderboard | LALIGA"
[2]: https://www.uefa.com/uefachampionsleague/standings/?utm_source=chatgpt.com "Table & standings | UEFA Champions League 2025/26"
[3]: https://www.uefa.com/uefachampionsleague/fixtures-results/bracket/?utm_source=chatgpt.com "Bracket view | UEFA Champions League 2025/26"
