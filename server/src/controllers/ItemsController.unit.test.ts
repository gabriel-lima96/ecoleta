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

const mockSelectMethod = jest.fn((item) => items);

jest.mock('../database/connection', () =>
  jest.fn().mockImplementation(() => ({ select: mockSelectMethod })),
);

describe('ItemsController unit test', () => {
  beforeEach(() => {
    mockSelectMethod.mockClear();
  });
  it('should fetch database items once', () =>
    request(app)
      .get('/items')
      .then((response) => {
        expect(mockSelectMethod).toHaveBeenCalledTimes(1);
      }));
  it('should return a success response', () =>
    request(app)
      .get('/items')
      .then((response) => {
        expect(response.status).toBe(200);
      }));
  it('should return a Content-Type json', () =>
    request(app)
      .get('/items')
      .then((response) => {
        // .toMatch pode receber um RegExp ou uma string
        expect(response.get('Content-Type')).toMatch('json');
      }));
  it('should return the array of items as json', () =>
    request(app)
      .get('/items')
      .then((response) => {
        const expectedItems = items.map((item) => ({
          id: item.id,
          title: item.title,
          image_url: `http://localhost:3333/uploads/${item.image}`,
        }));
        // .toBe só funciona com tipos extritos ou se o objeto é exatamente o mesmo (mesma referência)
        expect(response.body).toEqual(expectedItems);
      }));
});
