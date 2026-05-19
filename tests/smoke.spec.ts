import { test, expect } from '@playwright/test';

const BASE_URL = 'https://habit-tracker-pi-one.vercel.app';

test('страница логина грузится', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Next/);
});

test('главная редиректит на логин', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveURL(/login/);
});