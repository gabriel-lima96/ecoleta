/* eslint @typescript-eslint/ban-types: "off" */
import faker from 'faker/locale/pt_BR';
import db from '../../src/database/connection';

const createFakePoint = () => {
  const companyName: string = faker.company.companyName();
  return {
    image: `${companyName.replace(/\s/g, '_')}.jpg`,
    name: companyName,
    email: faker.internet.email(),
    whatsapp: faker.phone.phoneNumber(),
    latitude: faker.address.latitude(),
    longitude: faker.address.longitude(),
    city: faker.address.city(),
    uf: faker.address.stateAbbr(),
  };
};

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

const persistNewPoint = async (point: any, itemsIds: number[]) => {
  const [pointId] = await db('points').insert(point);
  const pointItems = itemsIds.map((itemId) => ({
    item_id: itemId,
    point_id: pointId,
  }));

  await db('point_items').insert(pointItems);

  return pointId;
};

export default async function factory(quantity: number) {
  const pointIds: number[] = [];
  let point: object;
  let items: number[];
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < quantity; i += 1) {
    point = createFakePoint();
    items = createArrayOfItemIds();
    pointIds.push(await persistNewPoint(point, items));
  }
  /* eslint-enable no-await-in-loop */

  return pointIds;
}
