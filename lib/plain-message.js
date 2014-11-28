//     telegram-mt-node
//     Copyright 2014 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     https://github.com/enricostara/telegram-mt-node

//     PlainMessage class
//
// This class provide a plain-text message for data transmission in some limited cases
// (ex. may be used to create an authorization key)

// Import dependencies
var util = require('util');
var utility = require("./utility");
var TypeObject = require("telegram-tl-node").TypeObject;

// To get an instance for `serialization`:
//
//     new PlainMessage({message: myMessageBuffer});
// Provide the payload as `Buffer`:
//
// To get an instance for `de-serialization`:
//
//     new PlainMessage({buffer: myBuffer});
// Provide a `buffer` containing the plain message from which extract the payload
function PlainMessage (options) {
    var super_ = this.constructor.super_.bind(this);
    var opts = options ? options : {};
    this._message = opts.message;
    super_(opts.buffer, opts.offset);
    if (this._message) {
        this._message = Buffer.isBuffer(this._message) ? this._message : new Buffer(this._message, 'hex');
        this._authKeyId = 0;
        this._messageId = utility.createMessageId();
        this._messageLength = this._message.length;
    }
    this._logger = require('get-log')('mtproto.PlainMessage');
}

// Extend TypeObject class
util.inherits(PlainMessage, TypeObject);

// This method serialize the PlainMessage
PlainMessage.prototype.serialize = function () {
    if (!this._message) {
        return false;
    }
    this.writeLong(this._authKeyId);
    this.writeLong(this._messageId);
    this.writeInt(this._messageLength);
    // call low level method
    this._writeBytes(this._message);
    if (this._logger.isDebugEnabled()) {
        this._logger.debug('Serialize message(%s) with authKeyId: %s, messageId: %s and writeOffset: %s',
            this._messageLength, this._authKeyId, this._messageId, this._writeOffset);
    }
    return this.retrieveBuffer();
};

// This method de-serialize the PlainMessage
PlainMessage.prototype.deserialize = function () {
    if (!this.isReadonly()) {
        return false;
    }
    this._authKeyId = this.readLong();
    this._messageId = this.readLong();
    this._messageLength = this.readInt();
    this._message = this._readBytes(this._messageLength);
    if (this._logger.isDebugEnabled()) {
        this._logger.debug('De-serialize message(%s) with authKeyId: %s and messageId: %s',
            this._messageLength, this._authKeyId, this._messageId);
    }
    return this;
};

// This method returns the payload
PlainMessage.prototype.getMessage = function () {
    return this._message;
};

// This method returns the message ID
PlainMessage.prototype.getMessageId = function () {
    return this._messageId;
};

// Export the class
module.exports = exports = PlainMessage;