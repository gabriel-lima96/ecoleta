import axios from 'axios';
import faker from 'faker/locale/pt_BR';
import FormData from 'form-data';
import app from '../../src/app';
import connection from '../../src/database/connection';
import factory from '../factories/PointsFactory';

const createArrayOfItemIds = (): number[] => {
  // usar Set para evitar duplicatas
  const set = new Set<number>();
  // 6 repeticoes tem uma chance muito baixa de ter todos os 6 itens
  const repeticoes = faker.datatype.number(12);
  for (let i = 0; i < repeticoes; i += 1) {
    // sao 6 itens no 'database/seed/create_items.ts'
    set.add(faker.datatype.number(6));
  }
  return Array.from(set);
};

describe('Points integration test', () => {
  beforeAll(async () => {
    await connection.migrate.latest();
    await connection.seed.run();
    app.listen(3333);
  });
  test('GET /points/{id}', async (done) => {
    const pointId = (await factory(1))[0];

    const items = await connection('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', pointId)
      .select('items.title');
    const point = await connection('points').where('id', pointId).first();

    const serializedPoint = {
      ...point,
      image_url: `http://localhost:3333/uploads/${point.image}`,
    };

    const response = await axios.get(`http://localhost:3333/points/${pointId}`);

    expect(response.data).toEqual({ point: serializedPoint, items });
    done();
  });
  test('POST /points', async (done) => {
    const companyName = faker.company.companyName();

    // const image = await axios.get(faker.image.business(), {
    //     responseType: 'blob'
    // });
    const formData = new FormData();
    // // formData.append('file', image.data, {
    // //     filename: companyName.replace(/\s/g, '_') + '.jpg'
    // // });
    // // formData.append('image', faker.image.business());
    formData.append('name', companyName);
    formData.append('email', faker.internet.email());
    formData.append(
      'whatsapp',
      Number.parseInt(faker.phone.phoneNumber('#########'), 10),
    );
    formData.append('latitude', faker.address.latitude());
    formData.append('longitude', faker.address.longitude());
    formData.append('city', faker.address.city());
    formData.append('uf', faker.address.stateAbbr());
    formData.append('items', createArrayOfItemIds().join(','));

    const response = await axios.post(
      'http://localhost:3333/points',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch('json');
    done();
  });
});
