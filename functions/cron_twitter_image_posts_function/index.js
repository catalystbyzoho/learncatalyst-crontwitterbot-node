const Twit = require('twit');
const util = require('util');
const { createCanvas } = require('canvas');
const secrets = require('./secrets.json');
const client = new Twit(secrets); 

/**
 * Uploads the created image to twitter
 * @param {*} b64content - Base 64 Image Created by Canvas
 */
async function upload(b64content) {
    return new Promise((resolve, reject) => {
        client.post('media/upload', { media_data: b64content }, (err, data) => {
            if (err) {
                reject('Error from Upload' + util.inspect(err));
                return;
            }
            resolve(data);
        });
    });
}

/**
 * Updates the caption for the uploaded image
 * @param {*} media_id_string - ID of the uploaded image 
 */
async function update({ media_id_string }) {
    return new Promise((resolve, reject) => {
        client.post('statuses/update', {
            status: '#upload4mMicroservice ',
            media_ids: media_id_string
        }, (err) => {
            if (err) {
                reject('Error from Update' + util.inspect(err));
                return;
            }
            resolve({ status: 'Tweet sent' });
        });
    });
}

/**
 * Creates an random image using Canvas
 */
function makeImage() {

    const width = 100;
    const height = 100;
    const canvas = createCanvas(width, height)

    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(180,0,0,1)';
    ctx.font = '10px Impact';
    ctx.rotate(.1);
    ctx.fillText('Catalyst Easy ', 10, 30);
    ctx.strokeStyle = 'rgba(0,192,192,0.9)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.strokeStyle = "red";
    ctx.stroke();

    const buffer = canvas.toBuffer('image/png');
    return buffer.toString('base64');
}

module.exports = async (_cronDetails, context) => {

    try {
        const base64 = makeImage();
        const data = await upload(base64);
        await update(data);
        context.closeWithSuccess();
    } catch (e) {
        console.log('error uploading image', e);
        context.closeWithFailure();
    }
}