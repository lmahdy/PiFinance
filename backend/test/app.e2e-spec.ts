import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as path from 'path';

describe('BI Platform (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let token: string;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
    connection = app.get<Connection>(getConnectionToken());

    await connection.collection('sales').deleteMany({});
    await connection.collection('purchases').deleteMany({});
    await connection.collection('stock').deleteMany({});
    await connection.collection('ai_insights').deleteMany({});

    const loginResponse = await request(server).post('/auth/login').send({
      email: 'owner@demo.com',
      password: 'Password123!',
    });

    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('uploads purchases CSV and sales CSV', async () => {
    const purchasesPath = path.resolve(__dirname, '..', '..', 'samples', 'purchases_sample.csv');
    const salesPath = path.resolve(__dirname, '..', '..', 'samples', 'sales_sample.csv');

    const purchasesRes = await request(server)
      .post('/purchases/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', purchasesPath);
    expect([200, 201]).toContain(purchasesRes.status);

    const salesRes = await request(server)
      .post('/sales/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', salesPath);
    expect([200, 201]).toContain(salesRes.status);
  });

  it('computes stock correctly', async () => {
    const res = await request(server)
      .get('/inventory/stock')
      .set('Authorization', `Bearer ${token}`);

    const stock = res.body.reduce((acc: Record<string, number>, row: any) => {
      acc[row.item] = row.currentStock;
      return acc;
    }, {});

    expect(stock['Laptop HP']).toBe(10);
    expect(stock['Keyboard']).toBe(66);
    expect(stock['Monitor 24']).toBe(13);
    expect(stock['Mouse']).toBe(45);
  });

  it('computes revenue by product correctly', async () => {
    const res = await request(server)
      .get('/sales/revenue-by-product')
      .set('Authorization', `Bearer ${token}`);

    const revenue = res.body.reduce((acc: Record<string, number>, row: any) => {
      acc[row._id] = row.revenue;
      return acc;
    }, {});

    expect(revenue['Laptop HP']).toBe(5100);
    expect(revenue['Monitor 24']).toBe(1260);
    expect(revenue['Keyboard']).toBe(600);
    expect(revenue['Mouse']).toBe(525);
  });

  it('computes report KPIs correctly', async () => {
    const res = await request(server)
      .get('/report/kpis')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.revenue).toBe(7485);
    expect(res.body.costs).toBeCloseTo(7614.83, 2);
    expect(res.body.profit).toBeCloseTo(-129.83, 2);
    expect(res.body.taxes).toBe(0);
  });

  it('writes AI insights (optional)', async () => {
    if (!process.env.RUN_ML_TESTS) {
      return;
    }
    const res = await request(server)
      .get('/ai/insights?module=sales')
      .set('Authorization', `Bearer ${token}`);

    const latest = res.body?.[0]?.payload;
    expect(latest.best_product).toBe('Laptop HP');
    expect(latest.worst_product).toBe('Mouse');
  });
});
