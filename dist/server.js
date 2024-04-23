"use strict";
const express = require('express');
const app = express();
const PORT = 3005;
const elts_games = {};
const elts_gameFinder = {};
const elts = [];
app.use(express.json()); // Pour parser les requêtes JSON
app.get('/data', (req, res) => {
    res.json(elts);
});
app.post('/data', (req, res) => {
    elts.push(req.body);
    //console.log("req.body reçues =>", req.body.vmId); // Affiche les données reçues dans la console
    res.status(200).send('Données reçues');
});
app.post('/games', (req, res) => {
    const { vmName, gameId, site, sport, checkCond, fromOrigin, dateSearch } = req.body; // Déstructure les données reçues
    if (!elts_games[gameId]) {
        elts_games[gameId] = {
            vmName: vmName,
            gameId: gameId,
            site: site,
            sport: sport,
            origin: {} // Initialiser origin comme un objet vide
        };
    }
    if (!elts_games[gameId].origin[fromOrigin]) {
        elts_games[gameId].origin[fromOrigin] = { dateSearch, checkCond }; // Initialiser les données pour fromOrigin
    }
    else {
        // Mise à jour des données si fromOrigin existe déjà
        elts_games[gameId].origin[fromOrigin].dateSearch = dateSearch;
        elts_games[gameId].origin[fromOrigin].checkCond = checkCond;
    }
    //console.log(`req.body reçues for gameId ${req.body.gameId}`); // Affiche les données reçues dans la console
    res.status(200).send('Données reçues');
});
app.get('/games', (req, res) => {
    res.json(Object.values(elts_games));
});
app.get('/games/:vmName', (req, res) => {
    const vmName = req.params.vmName;
    const games = Object.values(elts_games).filter(game => game.vmName === vmName);
    const games_displayed = games.map(game => {
        return {
            gameId: game.gameId,
            checkCond: game.checkCond,
            origin: game.origin
        };
    });
    res.json(games_displayed);
});
app.post('/gameFinder', (req, res) => {
    const { vmName, finderId, site, sport, checkCond, nbGamesSuccess, nbGamesTotal, dateSearch } = req.body; // Déstructure les données reçues
    if (!elts_gameFinder[finderId]) {
        elts_gameFinder[finderId] = [];
    }
    elts_gameFinder[finderId].push(req.body);
    if (elts_gameFinder[finderId].length > 10) {
        elts_gameFinder[finderId].shift();
    }
    res.status(200).send('Données reçues');
});
app.get('/gameFinder', (req, res) => {
    for (const finderId of Object.keys(elts_gameFinder)) {
        elts_gameFinder[finderId].sort((a, b) => {
            const dateA = new Date(a.dateSearch).getTime();
            const dateB = new Date(b.dateSearch).getTime();
            return dateB - dateA;
        });
    }
    res.json(elts_gameFinder);
});
app.get('/gameFinder/last', (req, res) => {
    const copy = JSON.parse(JSON.stringify(elts_gameFinder));
    for (const finderId of Object.keys(elts_gameFinder)) {
        copy[finderId] = elts_gameFinder[finderId].slice(-1);
    }
    res.json(copy);
});
app.listen(PORT, () => {
    console.log(`Serveur à l'écoute sur le port ${PORT}`);
});
