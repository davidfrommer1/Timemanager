
import { UserSession } from './user-session';

describe('/recordtrips', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });
  describe('#POST', () => {
    it('should return a proper recordtrip json document', async () => {
      const now = new Date().getTime();
      const response = await userSession.post('/recordtrips', {
        fromdate: '2021-06-10',
        todate: '2021-06-11',
        hours: '8',
        destination: 'Berlin',
        customer: 'BMG'
      });
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.fromdate).toBe('2021-06-10');
      expect(json.todate).toBe('2021-06-11');
      expect(json.hours).toBe('8');
      expect(json.destination).toBe('Berlin');
      expect(json.customer).toBe('BMG');
      expect(json.id).toBeTruthy();
      expect(json.createdAt).toBeTruthy();
      expect(Number(json.createdAt)).toBeGreaterThanOrEqual(now);
    });
    it('should return error with status 401', async () => {
      await userSession.deleteUser();
      const response = await userSession.post('/recordtrips', {
        fromdate: '2021-06-10',
        todate: '2021-06-11',
        hours: '8',
        destination: 'Berlin',
        customer: 'BMG'
      });
      expect(response.status).toBe(401);
    });
  });
  describe('#GET', () => {
    it('should return an empty list of recordtrips given a new user', async () => {
      const response = await userSession.get('/recordtrips');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results).toEqual([]);
    });
    it('should return a list with a single recordtrip given a user with a single recordtrip', async () => {
      await userSession.post('/recordtrips', {
        fromdate: '2021-06-10',
        todate: '2021-06-11',
        hours: '8',
        destination: 'Berlin',
        customer: 'BMG'
      });
      const response = await userSession.get('/recordtrips');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);
      expect(json.results[0].fromdate).toEqual('2021-06-10');
    });
  });
  describe('#PATCH', () => {
    it('should change the destination of the first recordtrip from Hamburg to Berlin', async () => {
      await userSession.post('/recordtrips', {
        fromdate: '2021-06-11',
        todate: '2021-06-12',
        hours: '16',
        destination: 'Hamburg',
        customer: 'Bertelsmann'
      });
      const response = await userSession.get('/recordtrips');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);
      expect(json.results[0].destination).toEqual('Hamburg');
      const newRecordtrip = {
        destination: 'Berlin'
      };
      await userSession.patch('/recordtrips/' + json.results[0].id, newRecordtrip);
      const response2 = await userSession.get('/recordtrips');
      expect(response2.status).toBe(200);
      const json2 = await response2.json();
      expect(json2.results.length).toEqual(1);
      expect(json2.results[0].destination).toEqual('Berlin');
    });
  });
  describe('#DELETE', () => {
    it('should delete the first recordtrips', async () => {
      await userSession.post('/recordtrips', {
        fromdate: '2021-06-10',
        todate: '2021-06-11',
        hours: '8',
        destination: 'Berlin',
        customer: 'BMG'
      });
      const response = await userSession.get('/recordtrips');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);

      await userSession.delete('/recordtrips/' + json.results[0].id);
      const response2 = await userSession.get('/recordtrips');
      expect(response2.status).toBe(200);
      const json2 = await response2.json();
      expect(json2.results.length).toEqual(0);
    });
  });
});
