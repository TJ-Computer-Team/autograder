const axios = require('axios');
axios.get('http://10.150.0.3:8080/wow')
        .then(res => {
                console.log("ping!");
        }).catch((error) => {
                console.log(error);
        });

axios.post('http://10.150.0.3:8080/penis', {"wow": "hi"})
       .then(res => {
                //console.log(res);
        }).catch((error) => {
               //console.log(error);
        });
