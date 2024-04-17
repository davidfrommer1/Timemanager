
import { UserSession } from './user-session';

describe('/holidays', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#POST', () => {
    it('should return a proper holidays json document', async () => {
      const now = new Date().getTime();
      const response = await userSession.post('/holidays', {
        title: 'Sommer',
        fromdate: '2021-06-10',
        todate: '2021-06-11'
      });
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.title).toBe('Sommer');
      expect(json.fromdate).toBe('2021-06-10');
      expect(json.todate).toBe('2021-06-11');
      expect(json.id).toBeTruthy();
      expect(json.createdAt).toBeTruthy();
      expect(Number(json.createdAt)).toBeGreaterThanOrEqual(now);
    });
  });
  describe('#GET', () => {
    it('should return a list with two holidays', async () => {
      await userSession.post('/holidays', {
        title: 'Sommer',
        fromdate: '2021-06-10',
        todate: '2021-06-11'
      });
      await userSession.post('/holidays', {
        title: 'Winter',
        fromdate: '2021-12-23',
        todate: '2022-01-06'
      });
      const response = await userSession.get('/holidays');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(2);
      expect(json.results[0].title).toEqual('Sommer');
      expect(json.results[1].title).toEqual('Winter');
    });
  });
  describe('#DELETE', () => {
    it('should delete the first holiday', async () => {
      await userSession.post('/holidays', {
        title: 'Winter',
        fromdate: '2021-12-23',
        todate: '2022-01-06'
      });
      const response = await userSession.get('/holidays');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);
      await userSession.delete('/holidays/' + json.results[0].id);
      const response2 = await userSession.get('/holidays');
      expect(response2.status).toBe(200);
      const json2 = await response2.json();
      expect(json2.results.length).toEqual(0);
    });
  });
});
