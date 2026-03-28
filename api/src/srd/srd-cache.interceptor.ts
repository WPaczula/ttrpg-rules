import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SrdCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    // Include query string in cache key so ?tier=1 and ?tier=2 are cached separately
    return `${request.path}?${new URLSearchParams(request.query).toString()}`;
  }
}
