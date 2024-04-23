import express, { Request, Response } from 'express';

const app = express();

const PORT = 3005;

interface Elts_Games {
    [gameId: string]: {
        vmName: string;
        gameId: string;
        site: string;
        sport: string;
        origin: {
            [fromOrigin: string]: {
                dateSearch: string;
                checkCond: boolean;
            }
        }
    }

}


interface Elts_GameFinder {
    [finderId: string]: {
        vmName: string;
        finderId: string;
        site: string;
        sport: string;
        checkCond: string;
        nbGamesSuccess: number;
        nbGamesTotal: number;
        dateSearch: string;
    }[]

}

interface Elts_Recus {
    vmId: string,
    status: string,
    timestamp: string
}

const elts_games: Elts_Games = {};
const elts_gameFinder: Elts_GameFinder = {}
const elts: Elts_Recus[] = []


app.use(express.json()); // Pour parser les requêtes JSON


app.get('/data', (req: Request, res: Response) => {//res.send('Bonjour du serveur!');
    res.json(elts)
});
app.get('/data/last', (req: Request, res: Response) => {//res.send('Bonjour du serveur!');
    res.json(elts.slice(-1))
});
app.post('/data', (req, res) => {
    elts.push(req.body);

    let elts_by_vmId = elts.filter(elt => elt.vmId === req.body.vmId);
    if (elts_by_vmId.length > 10) {
        elts_by_vmId.shift();
    }

    //console.log("req.body reçues =>", req.body.vmId); // Affiche les données reçues dans la console
    res.status(200).send('Données reçues');
});


app.post('/games', (req: Request, res: Response) => {
    const { vmName, gameId, site, sport, checkCond, fromOrigin, dateSearch } = req.body; // Déstructure les données reçues

    if (!elts_games[gameId]) {
        elts_games[gameId] = {
            vmName: vmName,
            gameId: gameId,
            site: site,
            sport: sport,
            origin: {} // Initialiser origin comme un objet vide
        }

    }

    if (!elts_games[gameId].origin[fromOrigin]) {
        elts_games[gameId].origin[fromOrigin] = { dateSearch, checkCond }; // Initialiser les données pour fromOrigin
    } else {
        // Mise à jour des données si fromOrigin existe déjà
        elts_games[gameId].origin[fromOrigin].dateSearch = dateSearch;
        elts_games[gameId].origin[fromOrigin].checkCond = checkCond;
    }
    //console.log(`req.body reçues for gameId ${req.body.gameId}`); // Affiche les données reçues dans la console
    res.status(200).send('Données reçues');
});
app.get('/games', (req, res) => {
    res.json(Object.values(elts_games));
})

app.get('/games/:vmName', (req: Request, res: Response) => {
    const vmName = req.params.vmName;
    const games = Object.values(elts_games).filter(game => game.vmName === vmName);
    const games_displayed = games.map(game => {
        return {
            gameId: game.gameId,
            origin: game.origin
        }
    });
    res.json(games_displayed);
})


app.post('/gameFinder', (req: Request, res: Response) => {
    const { vmName, finderId, site, sport, checkCond, nbGamesSuccess, nbGamesTotal, dateSearch } = req.body; // Déstructure les données reçues

    if (!elts_gameFinder[finderId]) {
        elts_gameFinder[finderId] = [];
    }

    elts_gameFinder[finderId].push(req.body)

    if (elts_gameFinder[finderId].length > 10) {
        elts_gameFinder[finderId].shift();
    }

    res.status(200).send('Données reçues');
});


app.get('/gameFinder', (req: Request, res: Response) => {
    for (const finderId of Object.keys(elts_gameFinder)) {
        elts_gameFinder[finderId].sort((a, b) => {
            const dateA = new Date(a.dateSearch).getTime();
            const dateB = new Date(b.dateSearch).getTime();
            return dateB - dateA;
        })
    }
    res.json(elts_gameFinder);
})

app.get('/gameFinder/last', (req: Request, res: Response) => {
    const copy = JSON.parse(JSON.stringify(elts_gameFinder));
    for (const finderId of Object.keys(elts_gameFinder)) {
        copy[finderId] = elts_gameFinder[finderId].slice(-1);
    }
    res.json(copy);
})

app.listen(PORT, () => {
    console.log(`Serveur à l'écoute sur le port ${PORT}`);
});


