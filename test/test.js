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

        // // //check for invalid password
        // it('If password does not match standards, it should return message with error', (done) =>{
        //     let body = {
        //         first_name: "Jai",
        //         last_name:  "Devmane",
        //         email_address: "jai@jai.com",
        //         password: "Dhananjai04@123",
        //     };

        //     chai.request(app)
        //         .post('/v1/user')
        //         .send(body)
        //         .end((err, res) =>{
        //             expect(res).to.have.status(400);
        //             done();
        //         })
        // });

        // //check for invalid email
        // //check for invalid password
        // it('If email does not match standards, it should return message with error', (done) =>{
        //     let body = {
        //         first_name: "Jai",
        //         last_name:  "Devmane",
        //         email_address: "jai@jai.com",
        //         password: "Aa@171111111"
        //     };

        //     chai.request(app)
        //         .post('/v1/user')
        //         .send(body)
        //         .end((err, res) =>{
        //             expect(res).to.have.status(400);
        //             done();
        //         })
        // });

        
    });
});
