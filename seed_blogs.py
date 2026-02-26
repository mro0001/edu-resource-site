"""
Seed script: inserts the four-part blog series into the database.

Usage (from edu-resource-site/):
    uv run python seed_blogs.py

Requires an admin user to exist. If none exists, creates one with
email admin@example.com / password "changeme".
"""

from datetime import datetime, timedelta
from sqlmodel import Session, select, create_engine

from backend.models.user import User
from backend.models.blog_post import BlogPost
from backend.database import engine, create_db_and_tables
from backend.auth import hash_password

BLOG_POSTS = [
    {
        "title": "Getting Started – Registering for GitHub and Claude",
        "slug": "getting-started-github-and-claude",
        "excerpt": "Two accounts, twenty minutes, and the first step toward actually sharing our course materials instead of just talking about it at conferences.",
        "tags": ["github", "claude", "getting-started", "collaboration"],
        "content": r"""I've been thinking about this problem for a while now. We–public budgeting and finance faculty–build assignments in isolation. You've probably spent dozens of hours developing case studies, problem sets, and simulations that teach the same concepts your colleagues at other universities are also teaching. We talk about it at ABFM. We nod about it over coffee at conferences. But we don't have a good system for actually sharing and improving each other's work.

That's what this blog series is about. I want to walk you through a workflow that lets us put course materials on GitHub and use AI tools to make those materials more interactive and engaging. This first post is just about creating two accounts. Twenty minutes, tops.

## Why GitHub (and not Google Drive)?

Google Drive is great for sharing files. But sharing files isn't the problem we're trying to solve. The problem is: how do you let another professor improve your assignment without destroying your original? How do you take the best parts of three different versions of the same revenue forecasting exercise and combine them? GitHub was designed for exactly this–tracking changes, proposing edits, merging improvements. We'll dig into the mechanics in Post 4.

## Step 1: Create a GitHub Account

Head to [github.com](https://github.com) and click "Sign up." Some unsolicited advice: use a recognizable username. If your colleagues are going to find you and collaborate, "jsmith-publicfinance" beats "xXbudgetNerd99Xx." (Though I respect the energy.) Your GitHub profile functions like a professional page, so treat the username accordingly.

You don't need a paid account. The free tier gives you everything we'll use: repositories, collaboration tools, and GitHub Pages for hosting assignments as live websites.

## Step 2: Sign Up for an AI Assistant

The second piece is an AI assistant. I use Claude (made by Anthropic), but you can substitute ChatGPT, Gemini, or whatever you're comfortable with.

Here's the important thing: the AI is not designing your assignments. You are. You know what makes a good exercise for teaching debt capacity analysis or fund accounting. The AI handles the part you probably don't want to learn in depth–writing the HTML, CSS, and JavaScript that turns your static assignment into something interactive. Think of it as a translator between your pedagogical ideas and the web technologies that bring them to life.

Go to [claude.ai](https://claude.ai) and create an account. The free tier works for getting started, but a paid subscription gives you longer conversations and more capable models.

## What's Next

That's it for setup. Two accounts. In the next post, we'll take one of your existing assignments and use AI to make it interactive–sliders, dynamic calculations, visualizations. If you've been meaning to modernize your course materials but didn't know where to start, this is the on-ramp.""",
    },
    {
        "title": "Using AI to Make Your Assignments Interactive",
        "slug": "using-ai-to-make-assignments-interactive",
        "excerpt": "Take a standard assignment and turn it into something students can interact with in a browser–no coding required. Here's the workflow.",
        "tags": ["ai", "interactive-assignments", "claude", "workflow"],
        "content": r"""You've got a GitHub account and an AI assistant set up. Now we do something with them.

In this post, I'll walk through taking a standard assignment and turning it into something interactive using AI. By "interactive," I mean an assignment that lives in a web browser where students can manipulate inputs and see outputs change–a revenue forecasting exercise with sliders, a debt affordability analysis with toggleable assumptions.

You don't need to know how to code. That's the whole point of the AI.

## The Basic Workflow

Start with your existing assignment–a Word doc, a PDF, whatever you've been handing out. Open Claude and describe what you want the interactive version to do. The AI generates the code. You paste it into a file, open it in a browser, and see if it works. You iterate until it does what you want. Then you put the finished file on GitHub (Post 3).

It's iterative and conversational–like working with a research assistant, except this one writes JavaScript.

## A Concrete Example

Say you teach a unit on revenue forecasting with a problem set where students manually calculate projected revenues under different growth assumptions. Here's what you might tell Claude:

> *"Create an interactive revenue forecasting exercise for my public budgeting course. Students should see a base revenue figure and adjust an annual growth rate using a slider (-5% to 10%). Display a table and line chart showing projected revenues over 5 years. Include reflection questions about what they observe at different growth rates."*

Claude generates a single HTML file containing everything needed to run this in a browser. HTML defines the structure, CSS makes it look decent, and JavaScript handles the calculations and interactivity.

## Claude Code: The Power Tool Version

Anthropic offers Claude Code, a command-line tool that can directly create and edit files on your computer. It's especially useful for assignments with multiple components or when modifying existing work. You can say "open the revenue forecasting exercise and add a section comparing property tax vs. sales tax revenue sensitivity" and it edits the file directly.

Setting up Claude Code requires some comfort with the command line, but Anthropic's documentation walks you through it. The regular Claude chat interface works perfectly well for everything in this series if you'd rather skip it.

## Tips From Trial and Error

**Be specific.** "Make me a budgeting assignment" gets you something generic. "Make me an interactive exercise where students allocate a $10 million general fund budget across six departments, see the percentage breakdown update in a pie chart, and receive a warning when any department falls below a minimum service threshold" gets you something useful.

**Iterate.** The first version is almost never exactly right. Tell it what to fix: "The chart labels are overlapping," "Add a reset button," "The calculations are wrong for the debt service ratio–here's the correct formula."

**Test it yourself.** Click every button. Try every edge case. Put in ridiculous numbers. I learned this one the hard way when a student discovered that a negative growth rate of -100% produced some very creative results in a projection table.

## What You End Up With

A single HTML file that runs entirely in a browser. No special software, no logins. Students just open a URL and start working.

And because it's just a file, it's easy to share. Another professor can take your exercise, fork it on GitHub, and adapt it–maybe adding elastic vs. inelastic revenue sources, or changing figures to match their state's budget. Your work becomes a foundation others build on. In the next post, we'll cover getting your assignment onto GitHub as a live website.""",
    },
    {
        "title": "Hosting Your Assignments on GitHub",
        "slug": "hosting-assignments-on-github",
        "excerpt": "Turn your interactive assignment into a live website using GitHub Pages–free hosting, version tracking, and a shareable URL.",
        "tags": ["github", "github-pages", "hosting", "tutorial"],
        "content": r"""You've built an interactive assignment. It works in your browser. Now you need to put it somewhere students and colleagues can access it. That's what GitHub Pages does–it turns your repository into a live website, for free.

## Quick Vocabulary

A **repository** (or "repo") is a folder that GitHub tracks–it holds your files and remembers every change. A **commit** is a saved snapshot with a note about what changed. **GitHub Pages** takes the files in your repository and serves them as a website. You upload an HTML file, GitHub gives you a URL.

## Step by Step: Your First Repository

Log into GitHub and click the green "New" button. Name it something descriptive–"revenue-forecasting-exercise" beats "assignment1." Six months from now you'll have multiple repos and want to tell them apart.

Set the repository to **Public**. GitHub Pages is free on public repos, and the whole philosophy here is openness. Check the box to add a README file. Click "Create repository."

## Uploading Your Files

Click "Add file" → "Upload files." Drag your HTML file (and any CSS, images, or data files) into the upload area. Write a commit message ("Initial upload of revenue forecasting exercise") and click "Commit changes."

Your files are now on GitHub, version-tracked, and visible to anyone with the link.

## Turning on GitHub Pages

Go to **Settings** → **Pages** (in the left sidebar). Under "Source," select **Deploy from a branch**. Choose **main** and **/ (root)**. Click **Save**.

After a minute or two, you'll see a URL like `https://yourusername.github.io/revenue-forecasting-exercise/`. Your interactive assignment is now live. Share that URL in your LMS, your syllabus, anywhere. No login required, no software to install.

## Updating Your Assignment

Find a bug or want to add a section? Edit files directly on GitHub (click the file, then the pencil icon) or upload a new version. Every change gets a commit message and GitHub keeps the entire history. You can always roll back if something breaks.

## Write a Good README

The README is the first thing visitors see. Include what the assignment covers, what course it's designed for, any key assumptions, and a link to the live GitHub Pages site. A good README is the difference between a repository that gets used and one that gets ignored.

## What's Next

You now have an interactive assignment hosted on the web for free. But the real power of GitHub isn't just hosting–it's collaboration. In the final post, I'll walk through forks, branches, and pull requests: the mechanics that let us build on each other's teaching materials instead of reinventing the wheel every semester.""",
    },
    {
        "title": "Forks, Branches, and Pull Requests – How We Actually Collaborate",
        "slug": "forks-branches-pull-requests-collaboration",
        "excerpt": "The mechanics that make GitHub fundamentally different from sharing files: structured collaboration on teaching materials without stepping on each other's toes.",
        "tags": ["github", "collaboration", "forks", "pull-requests", "branches"],
        "content": r"""This is where it all comes together. The previous posts were about getting set up, building something, and putting it online. This one is about structured collaboration–improving each other's work without stepping on each other's toes.

Four concepts: forks, branches, commits, and pull requests. They sound like jargon, but the ideas are straightforward.

## The Analogy

You've written a case study on municipal bond analysis. A colleague sees it and wants to add a section on credit ratings. In the pre-GitHub world, they'd email you for the file, modify their copy, maybe email it back. Now you've got two versions. If a third colleague wants to add something, which version do they start from? It gets messy fast.

GitHub solves this with a structured workflow.

## Forks: Making Your Own Copy

A **fork** is a complete copy of someone else's repository under your own account. Your colleague forks your case study, gets their own version they can modify freely without affecting your original. The fork maintains a link back to the original–that's what makes the next steps possible.

## Branches: Working on Changes Safely

A **branch** is a parallel version of the files within a repository–a draft workspace. Your colleague creates a branch called "add-credit-ratings" and works there. The **main** branch stays untouched.

Branches let you work on multiple changes at once without interference. If the credit ratings addition works out but a calculation tweak introduces a bug, you keep one and discard the other.

## Commits: Saving With Context

A **commit** is a snapshot paired with a message about what changed. Good messages matter. "Updated file" tells you nothing. "Added credit rating analysis with Moody's and S&P rating scales" tells you exactly what happened. Commits create a detailed change log–who added the scenario analysis, who fixed the formula, who reformatted the instructions.

## Pull Requests: Proposing Changes

A **pull request** (PR) is how you propose that your changes be incorporated into the original repository. Your colleague submits a PR after adding credit ratings. This opens a conversation, not an automatic merge.

You can see exactly what changed, line by line. You leave comments: "Could you also mention Fitch ratings?" They make edits. When everyone's satisfied, you **merge** and their changes become part of the official version. PRs are transparent, non-destructive, and documented.

## Why This Matters for Us

Public budgeting and finance pedagogy doesn't have good infrastructure for collaboration. We share syllabi on PASyllabi.com, swap ideas at conferences, occasionally email files. But there's no system for iterative improvement on shared teaching materials.

Picture this: a repository of interactive exercises covering the core public budgeting curriculum–revenue forecasting, expenditure analysis, capital budgeting, debt management, fund accounting. Any instructor can fork the collection, adapt exercises for their context, and submit pull requests with improvements. An instructor in Texas adjusts for Texas's tax structure. Someone at a tribal college adds a module on tribal gaming revenue. A colleague with a knack for visualization improves the charts. Each contribution makes the whole collection better.

Open-source software works this way every day. There's no reason we can't apply the same model to teaching materials.

## Getting Started

If you've followed this series, you're ready. You have a GitHub account, you can build interactive assignments with AI, you know how to host them. Now you know the collaboration mechanics. Find a colleague who teaches similar material. Share your repository. Fork theirs. Submit a pull request with an improvement–even something small like fixing a typo or adding a reflection question. The important thing is to start.

I'm working on building out a shared repository for public budgeting and finance assignments and would love collaborators. If this series has been useful or if you're interested in contributing, reach out. This works better the more people are involved.""",
    },
]


def seed():
    create_db_and_tables()

    with Session(engine) as session:
        # Find or create an admin user to be the author
        admin = session.exec(
            select(User).where(User.role == "admin")
        ).first()

        if not admin:
            admin = User(
                email="admin@example.com",
                display_name="Michael Overton",
                hashed_password=hash_password("changeme"),
                role="admin",
                verification_status="verified",
                institution="University of Idaho",
            )
            session.add(admin)
            session.commit()
            session.refresh(admin)
            print(f"Created admin user: {admin.email} (change the password!)")

        # Check for existing posts by slug to avoid duplicates
        existing_slugs = set(
            session.exec(select(BlogPost.slug)).all()
        )

        now = datetime.utcnow()
        created = 0
        for i, post_data in enumerate(BLOG_POSTS):
            if post_data["slug"] in existing_slugs:
                print(f"  Skipped (already exists): {post_data['title']}")
                continue

            post = BlogPost(
                title=post_data["title"],
                slug=post_data["slug"],
                content=post_data["content"],
                excerpt=post_data["excerpt"],
                tags=post_data["tags"],
                author_id=admin.id,
                is_published=True,
                published_at=now - timedelta(days=(3 - i) * 7),  # weekly spacing
                created_at=now - timedelta(days=(3 - i) * 7),
            )
            session.add(post)
            created += 1
            print(f"  Created: {post_data['title']}")

        session.commit()
        print(f"\nDone. {created} blog post(s) seeded.")


if __name__ == "__main__":
    seed()
