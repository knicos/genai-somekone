# GenAI Social Media Application

A web-based Social Media simulator for children and learners to explore data collection, profiling and recommendation algorithms as a collaborative classroom activity.

A version of this application is freely available at [https://somekone.gen-ai.fi](https://somekone.gen-ai.fi/). The site does not track you or send your data to servers, all calculations are done in your browser. The sharing and collaboration functionality is peer-2-peer which requires our server to initiate the connection. It is recommended that all users are on the same wifi network and that this is not a highly restricted public network.

## Who made it?

This application is developed as a part of the [Generation AI](https://www.generation-ai-stn.fi) research project in Finland, in partnership with 12 schools.

### Citation

_N. Pope, J. Kahila, J. Laru, H. Vartiainen, T. Roos and M. Tedre, "An Educational Tool for Learning about Social Media Tracking, Profiling, and Recommendation," 2024 IEEE International Conference on Advanced Learning Technologies (ICALT), Nicosia, North Cyprus, Cyprus, 2024, pp. 110-112, doi: 10.1109/ICALT61570.2024.00038._

## Installation

This is a [React](https://react.dev/) web application that is developed within Node.js using `npm`. If you wish to build your own deployment you will need Node.js installed on your machine.

Steps to install and build:

1. Download the source code from Github.
2. `npm install`
3. `npm run build`
4. Copy the contents of the `dist` folder to a web server.

For the Peer-2-Peer functionality, some environment variables need to be configured to point to your own server. Please contact us if you need help creating your own server, based around the PeerJS package. A simple server example is provided [here](https://github.com/knicos/genai-server).

```
VITE_APP_APIURL=http://localhost:9000
```

## Development

The app uses "vite". You can start a development server using `npm run dev` and use `npm test` to run the automated tests.

This app depends on two other packages for base components and the core recommendation algorithm. See https://github.com/knicos/genai-base and https://github.com/knicos/genai-recommender.
