import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {singleSpaPropsSubject} from "../single-spa/single-spa-props";
import {FormControl, FormGroup} from "@angular/forms";
import {Editor, Toolbar, Validators} from "ngx-editor";
import {CreateCommentDto} from "./models/create-comment-dto";
import {PostService} from "./service/post.service";
import {CommentDto} from "./models/comment-dto";

@Component({
    selector: 'app-parcel-comments',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    private propSubscription: Subscription | undefined;
    form = new FormGroup({
        editorContent: new FormControl("", Validators.required()),
    });
    editor: Editor = new Editor();
    minimalToolbar: Toolbar = [
        ["bold", "italic"],
        ["underline", "strike"],
        ["link"],
        ["text_color", "background_color"],
    ];
    postId?: number;

    constructor(private postService: PostService) {
    }
    ngOnInit(): void {
        this.propSubscription = singleSpaPropsSubject.subscribe(props => {
            this.postId = props.postId;
        })
    }

    ngOnDestroy(): void {
        this.propSubscription?.unsubscribe();
        this.editor.destroy();
    }

    public validateFormControl(): boolean {
        // Here, "!" is used since there are only 2 properties to check => Hardcoded and not dynamic. will always be available
        return this.form.get("editorContent")!.invalid &&
            (this.form.get("editorContent")!.dirty ||
                this.form.get("editorContent")!.touched) || false;
    }

    publishComment() {
        if (!this.form.valid || this.postId == null) {
            Object.keys(this.form.controls).forEach(field => {
                const control = this.form.get(field);
                control?.markAsTouched({onlySelf: true});
            });
            return;
        }

        const commentToCreate: CreateCommentDto = {
            text: this.form.get("editorContent")!.value!,
            postId: this.postId
        };

        this.postService.createCommentForPost(commentToCreate).subscribe({
            next: (comment) => {
                // this.toastService.show({body: "Comment published!"});
                this.notifyReactApp(comment);

                this.form.reset();
                Object.keys(this.form.controls).forEach(key => {
                    const control = this.form.get(key);
                    control?.markAsPristine();
                    control?.markAsUntouched();
                    control?.updateValueAndValidity();
                    control?.setErrors(null);
                });
            },
            error: (error) => {
                console.error("Could not publish comment", error);
                // this.toastService.show({body: "Could not publish comment, try again later!", error: true});
            },
        });
    }

    notifyReactApp(comment: CommentDto) {
        const customEvent = new CustomEvent('commentAdded', {
            detail: {
                comment,
            },
        });
        window.dispatchEvent(customEvent);
    }
}
