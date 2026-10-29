<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Onboarding guide chat streams from `src/routes/api/chat.ts` via AI SDK Responses on the gateway; its answers are grounded only in `src/lib/ai/guidance.ts` — update that file when official form contents change, so the assistant never invents form details.
- Guide conversations are stored per thread in browser localStorage (`src/lib/threads.ts`), one URL per thread at `/help/$threadId`, because no accounts exist.
