import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CreateCommentDto} from "../models/create-comment-dto";
import {environment} from "../../environments/environment";
import {CommentDto} from "../models/comment-dto";

@Injectable({
    providedIn: "root"
})
export class PostService {

    constructor(private http: HttpClient) {
    }
    public createCommentForPost(comment: CreateCommentDto): Observable<CommentDto> {
        return this.http.post<CommentDto>(`${environment.backendUrl}/comments`, comment);
    }
}
