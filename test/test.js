let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let app = require('../server');

const assert = require('chai').assert;
const {expect} = chai;

chai.use(chaiHttp);

describe('WebApp API Test', ()=> {

    describe('GET check', () =>{

        //check for user login
        it('Check for user login', (done) =>{

            chai.request(app)
                .get('/')
                .end((err, res) =>{
                    expect(res).to.have.status(200);
                    done();
                })
        });

    });


    describe('POST check', () =>{

        //check for invalid body, fields empty
        it('If body fields are empty, it should return message with error', (done) =>{
            let body = {
                first_name: "Jai",
                last_name:  "Devmane"
            };

            chai.request(app)
                .post('/v1/user')
                .send(body)
                .end((err, res) =>{
                    expect(res).to.have.status(400);
                    done();
                })
        });
        
    });
});
