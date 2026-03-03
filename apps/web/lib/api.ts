import { ApiConfig } from '@movie/api-client';export const apiConfig=():ApiConfig=>({baseUrl:process.env.NEXT_PUBLIC_API_BASE_URL??'http://localhost:4000'});
