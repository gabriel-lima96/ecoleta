/* eslint import/no-extraneous-dependencies: "off" */
import request from 'supertest';
import app from '../app';

const items = [
  {
    id: 1,
    title: 'Churrasqueiras',
    image: 'churrasqueiras.png',
  },
  {
    id: 3,
    title: 'Controle Remoto',
    image: 'controle_remoto.jpg',
  },
];

const mockSelectMethod = jest.fn(() => items);

jest.mock('../database/connection', () =>
  jest.fn().mockImplementation(() => ({ select: mockSelectMethod })),
);

describe('ItemsController unit test', () => {
  beforeEach(() => {
    mockSelectMethod.mockClear();
  });
  it('should fetch database items once', (done) =>
    request(app)
      .get('/items')
      .then(() => {
        expect(mockSelectMethod).toHaveBeenCalledTimes(1);
        done();
      }));

  it('should return a success response', (done) =>
    request(app)
      .get('/items')
      .then((response) => {
        expect(response.status).toBe(200);
        done();
      }));

  it('should return a Content-Type json', (done) =>
    request(app)
      .get('/items')
      .then((response) => {
        // .toMatch pode receber um RegExp ou uma string
        expect(response.get('Content-Type')).toMatch('json');
        done();
      }));

  it('should return the array of items as json', (done) =>
    request(app)
      .get('/items')
      .then((response) => {
        const expectedItems = items.map((item) => ({
          id: item.id,
          title: item.title,
          image_url: `http://localhost:3333/uploads/${item.image}`,
        }));
        // .toBe só funciona com tipos extritos ou se o objeto é exatamente o mesmo
        expect(response.body).toEqual(expectedItems);
        done();
      }));
});
