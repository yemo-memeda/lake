# Welcome to the Merico Technical Interview for Backend

In this test of 60-90 minutes, we want to watch you code a real world problem for us.

## Pre-requisits

Install Docker and Node and look over the READMEs in this project. 

## Evaluation

Make a PR to this repo that solves the following problems. We are looking for:

1. Well documented code
2. Tested code
3. Code that handles errors and edge cases
4. A solid looking PR
5. Good navigation and understanding of existing code

## The Task You Need to Solve

1. Make a new plugin in `src/plugins` called `pokemon-pond`

TIP: you can refernce other plugins like `src/plugins/gitlab-pond`

2. Create a data model to store pokemon.

TIP: you can reference the `gitlabCommit` model

3. Fetch all pokemon from this api: `https://pokeapi.co/` `GET https://pokeapi.co/api/v2/pokemon`

TIP: be sure you have fetched them all as efficiently as possible

4. Store all pokemon in mongo and postgres.

5. Enhance the pokemon data with total `cost` of all the items they are holding. IE: `GET https://pokeapi.co/api/v2/item/251`

TIP: Show off your testing skills with this step

## Notes

This may take more time than 60 minutes but just get as much done as possible.

If you have any questions before we get started, please make a github issue in this repo.