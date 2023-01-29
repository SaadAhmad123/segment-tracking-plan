export type Commit = {
    uuid: string
    content: string
    created_at: string
    repository_id: string
    author_id: string
    branch_id: string
    parent_id: string
}

export type CommitParent = {
    uuid: string
    commit_id: string
    parent_id: string
    order: number
}

export type Branch = {
    uuid: string
    name: string
    created_at: string
    repository_id: string
    author_id: string
    head_commit_id: string
}