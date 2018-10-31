const axios = require('axios');

class ClientService {
    constructor(){
        this.service = axios.create({
            baseURL: 'http://localhost:9001',
            withCredentials: true
          });
    }

    send_message (destination, body) {
        return this.service.post('/message', {destination, body})
        .then(response => console.log("RESPONSE", response.data.data))
        .catch (e => console.log("ERROR", e.response.data.status))
}
}

module.exports = ClientService;