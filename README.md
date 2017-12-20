BASSctrl
========

[![Build Status](https://jenkins.stammgruppe.eu/buildStatus/icon?job=BASSctrl/master)](https://jenkins.stammgruppe.eu/job/BASSctrl/job/master/)

Webinterface for the [geco/BASS](https://github.com/VSETH-GECO/BASS) project.

## Why
The same reasons its server project has but of course we want to provide our users with
a nice gui and not just the raw api.

## Running
This being a website it can be run over any webserver (nginx or apache jus to name some).
To compile the typescript you want to run `ng build -prod` (requires angular-cli) or use the pre-built
version on [Jenkins](https://jenkins.stammgruppe.eu/job/BASSctrl/job/master/).

## Further help
All of this uses the angular-cli, so if any more help is needed use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
