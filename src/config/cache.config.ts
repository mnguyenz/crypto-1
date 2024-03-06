import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';

export const cacheConfig = CacheModule.register();

@Global()
@Module({
    exports: [cacheConfig],
    imports: [cacheConfig]
})
export class GlobalCacheModule {}
