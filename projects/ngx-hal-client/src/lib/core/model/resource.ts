import { BaseResource } from './base-resource';
import { Observable } from 'rxjs/internal/Observable';
import { throwError as observableThrowError } from 'rxjs/internal/observable/throwError';
import { CacheHelper } from '../cache/cache.helper';
import { HttpHeaders } from '@angular/common/http';

export abstract class Resource extends BaseResource {

    // Adds the given resource to the bound collection by the relation
    public addRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }

        return this.resourceClientService.putResource(this.getRelationLinkHref(relation),
            resource._links.self.href, {
                headers: new HttpHeaders({'Content-Type': 'text/uri-list'})
            });
    }

    // Bind the given resource to this resource by the given relation
    public updateRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }

        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));
        return this.resourceClientService.patchResource(this.getRelationLinkHref(relation),
            resource._links.self.href, {
                headers: new HttpHeaders({'Content-Type': 'text/uri-list'})
            });
    }

    // Bind the given resource to this resource by the given relation
    public substituteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }

        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));
        return this.resourceClientService.putResource(this.getRelationLinkHref(relation),
            resource._links.self.href, {
                headers: new HttpHeaders({'Content-Type': 'text/uri-list'})
            });
    }

    // Unbind the resource with the given relation from this resource
    public deleteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        const link: string = resource._links.self.href;
        const idx: number = link.lastIndexOf('/') + 1;

        if (idx === -1) {
            return observableThrowError('no relation found');
        }

        const relationId: string = link.substring(idx);
        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation) + '/' + relationId);

        return this.resourceClientService
            .deleteResource(this.getRelationLinkHref(relation) + '/' + relationId);
    }

    public getSelfLinkHref(): string {
        return this.getRelationLinkHref('self');
    }

}
