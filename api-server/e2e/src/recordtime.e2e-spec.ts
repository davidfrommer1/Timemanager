import { UserSession } from './user-session';

describe('/recordtime', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#POST', () => {
    it('should return error with status 401', async () => {
      await userSession.deleteUser();
      const response = await userSession.post('/recordtime', {
        duration: '1:30',
        date: '10.06.2021'
      });
      expect(response.status).toBe(401);
    });
  });

  describe('#GET', () => {
    it('should get an empty array', async () => {
      const response = await userSession.get('/recordtime');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results).toEqual([]);
    });
    it('should get an array of 1 recorded Time', async () => {
      await userSession.post('/recordtime', { date: '10.06.2021', duration: '5:45' });
      const response = await userSession.get('/recordtime');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results[0].date).toEqual('10.06.2021');
      expect(json.results[0].duration).toEqual('5:45');
    });
  });
  describe('#DELETE', () => {
    it('should delete the first booked time', async () => {
      await userSession.post('/recordtime', {
        date: '20.06.2021',
        duration: '08:30'
      });
      const response = await userSession.get('/recordtime');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);
      await userSession.delete('/recordtime/' + json.results[0].id);
      const responseget = await userSession.get('/recordtime');
      expect(responseget.status).toBe(200);
      const jsondel = await responseget.json();
      expect(jsondel.results.length).toEqual(0);
    });
  });
});
