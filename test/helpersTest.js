const assert = require('chai').assert;

const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  'abc': {
    id: 'abc',
    email: 'dominik@example.com',
    password: 'I-love-tennis'
  },
  'def': {
    id: 'def',
    email: 'nicole@example.com',
    password: 'big-cars-smell'
  }
};

describe('#getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail('nicole@example.com', testUsers);
    assert.equal(user, testUsers.def);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = getUserByEmail('noone@example.com', testUsers);
    assert.equal(user, undefined);
  });
});

const testUrls = {
  'abcd': {
    longURL: 'http://www.google.com',
    userID: 'Dom'
  },
  'efgh': {
    longURL: 'http://www.youtube.com',
    userID: 'nic'
  },
  'ijkl': {
    longURL: 'http://www.facebook.com',
    userID: 'sam'
  }
};

describe('#urlsForUser', () => {
  it('should return the corresponding urls for a valid user', () => {
    const userUrls = urlsForUser('Dom', testUrls);
    const expectedResult = {
      'abcd': {
        longURL: 'http://www.google.com',
        userID: 'Dom'
      },
      'ijkl': {
        longURL: 'http://www.facebook.com',
        userID: 'sam'
      }
    };

    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty obhect for a non-existent user', () => {
    const userUrls = urlsForUser('crystal', testUrls);
    assert.deepEqual(userUrls, {});
  });
});