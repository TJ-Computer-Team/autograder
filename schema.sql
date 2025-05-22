--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Postgres.app)
-- Dumped by pg_dump version 17.5 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: checker; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checker (
    id integer NOT NULL,
    code text,
    lang character varying(20)
);


--
-- Name: checker_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checker_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checker_id_seq OWNED BY public.checker.id;


--
-- Name: checkers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checkers (
    checker_id integer NOT NULL,
    checker_code text NOT NULL,
    language character varying(50) NOT NULL
);


--
-- Name: checkers_checker_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checkers_checker_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checkers_checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checkers_checker_id_seq OWNED BY public.checkers.checker_id;


--
-- Name: contests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contests (
    id integer NOT NULL,
    name character varying(100),
    start timestamp without time zone,
    "end" timestamp without time zone,
    rated boolean DEFAULT false,
    editorial text,
    is_team boolean DEFAULT false
);


--
-- Name: contests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contests_id_seq OWNED BY public.contests.id;


--
-- Name: problems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problems (
    pid integer NOT NULL,
    name character varying(100),
    contestid integer,
    checkerid integer,
    tl integer,
    ml integer,
    interactive boolean DEFAULT false,
    statement text,
    secret boolean DEFAULT false,
    solution text,
    sollang character varying(20),
    inputtxt text,
    outputtxt text,
    samples text,
    points integer DEFAULT 0
);


--
-- Name: problems_pid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.problems_pid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: problems_pid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.problems_pid_seq OWNED BY public.problems.pid;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    usr bigint,
    code text,
    problemid integer,
    language character varying(20),
    runtime integer,
    memory integer,
    verdict character varying(50),
    problemname character varying(100),
    contest integer,
    "timestamp" bigint,
    insight text,
    team_id integer
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    team_id integer NOT NULL,
    user_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(64) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    secret_code character varying(32),
    contest_score real DEFAULT 0
);


--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    display_name character varying(100),
    username character varying(100),
    rating integer DEFAULT 1500,
    admin boolean DEFAULT false,
    usaco_division character varying(20),
    cf_rating integer,
    cf_handle character varying(100),
    email character varying(255) DEFAULT ''::character varying NOT NULL,
    pass character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: checker id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checker ALTER COLUMN id SET DEFAULT nextval('public.checker_id_seq'::regclass);


--
-- Name: checkers checker_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkers ALTER COLUMN checker_id SET DEFAULT nextval('public.checkers_checker_id_seq'::regclass);


--
-- Name: contests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contests ALTER COLUMN id SET DEFAULT nextval('public.contests_id_seq'::regclass);


--
-- Name: problems pid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems ALTER COLUMN pid SET DEFAULT nextval('public.problems_pid_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Data for Name: checker; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checker (id, code, lang) FROM stdin;
1	return 0;	cpp
\.


--
-- Data for Name: checkers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checkers (checker_id, checker_code, language) FROM stdin;
1	return a == b;	Python
\.


--
-- Data for Name: contests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contests (id, name, start, "end", rated, editorial, is_team) FROM stdin;
1	Sample Contest	2025-05-18 15:09:00.535992	2025-05-18 17:09:00.535992	t	https://example.com/editorial	t
2	Team Practice Contest	2025-06-01 10:00:00	2025-06-01 13:00:00	f	\N	t
\.


--
-- Data for Name: problems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.problems (pid, name, contestid, checkerid, tl, ml, interactive, statement, secret, solution, sollang, inputtxt, outputtxt, samples, points) FROM stdin;
1	Sample Problem	1	1	2000	256	f	This is a sample problem statement.	f		cpp	1 2	3	Input: 1 2\\nOutput: 3	100
2	A+B Problem	1	1	1000	256	f	Given two integers a and b, output their sum.	f		\N	1 2\\n	3\\n	1 2\\n3\\n	100
1001	Sample Team Problem	2	\N	\N	\N	f	\N	f	\N	\N	\N	\N	\N	100
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, usr, code, problemid, language, runtime, memory, verdict, problemname, contest, "timestamp", insight, team_id) FROM stdin;
1	\N		1	python	\N	-1	ERROR	Sample Problem	1	1747671265211	Grading server error:\nError: read ECONNRESET	\N
2	\N	#include <bits/stdc++.h>\r\n\r\nusing namespace std;\r\n\r\nint main(){\r\n\tint a, b; cin >> a >> b;\r\n\tcout << (a+b) << endl;\r\n}	2	cpp	\N	-1	ERROR	A+B Problem	1	1747677577154	Grading server error:\nError: read ECONNRESET	\N
3	\N	#include <bits/stdc++.h>\r\n\r\n\r\nint. main((){\r\n\tl;\r\n}	1	cpp	\N	-1	ERROR	Sample Problem	1	1747680769762	Grading server error:\nError: read ECONNRESET	\N
4	\N	#include <bits/stdc++.h>\r\n\r\nusing namespace std;\r\n\r\nusing ll = long long;\r\nusing d = double;\r\nusing str = string;\r\n\r\nusing pll = pair<ll, ll>;\r\nusing pii = pair<int, int>;\r\n#define f first\r\n#define s second\r\n\r\nusing vll = vector<ll>;\r\nusing vi = vector<int>;\r\nusing vvll = vector<vector<ll>>;\r\nusing vvi = vector<vector<int>>;\r\nusing vpii = vector<pair<int, int>>;\r\nusing vpll = vector<pair<ll, ll>>;\r\n\r\n#define FOR(i, a) for(int i = 0; i < a; i++)\r\n#define ROF(i, a) for(int i = a; i >= 0; i--)\r\n#define FORA(i, a, b) for(int i = a; i <= b; i++)\r\n#define ROFA(i, a, b) for(int i = b; i >= a; i--)\r\n\r\n\r\n\r\nvoid solve(){\r\n    int a, b; cin >> a >> b;\r\n\tcout << (a+b) << "\\n";\r\n}\r\n\r\nint main(){\r\n    ios::sync_with_stdio(false); cin.tie(nullptr);\r\n    solve();\r\n}\r\n	2	cpp	\N	-1	ERROR	A+B Problem	1	1747705985562	Grading server error:\nError: read ECONNRESET	\N
5	1003241	#include <bits/stdc++.h>\r\n\r\nusing namespace std;\r\n\r\nusing ll = long long;\r\nusing d = double;\r\nusing str = string;\r\n\r\nusing pll = pair<ll, ll>;\r\nusing pii = pair<int, int>;\r\n#define f first\r\n#define s second\r\n\r\nusing vll = vector<ll>;\r\nusing vi = vector<int>;\r\nusing vvll = vector<vector<ll>>;\r\nusing vvi = vector<vector<int>>;\r\nusing vpii = vector<pair<int, int>>;\r\nusing vpll = vector<pair<ll, ll>>;\r\n\r\n#define FOR(i, a) for(int i = 0; i < a; i++)\r\n#define ROF(i, a) for(int i = a; i >= 0; i--)\r\n#define FORA(i, a, b) for(int i = a; i <= b; i++)\r\n#define ROFA(i, a, b) for(int i = b; i >= a; i--)\r\n\r\n\r\n\r\nvoid solve(){\r\n    int a, b; cin >> a >> b;\r\n\tcout << (a+b) << endl;\r\n}\r\n\r\nint main(){\r\n    ios::sync_with_stdio(false); cin.tie(nullptr);\r\n    solve();\r\n}\r\n	1	cpp	\N	-1	ERROR	Sample Problem	1	1747743079830	Grading server error:\nError: read ECONNRESET	\N
6	1003241	a	1	cpp	-1	-1	Running	Sample Problem	1	1747747624291	\N	\N
7	1003241	a	1	cpp	\N	-1	ERROR	Sample Problem	1	1747747720406	Grading server error:\nError: read ECONNRESET	\N
8	1003241	a	1	cpp	-1	-1	Running	Sample Problem	1	1747747804276	\N	\N
9	1003241	#include <bits/stdc++.h>\r\n\r\nusing namespace std;\r\n\r\nusing ll = long long;\r\nusing d = double;\r\nusing str = string;\r\n\r\nusing pll = pair<ll, ll>;\r\nusing pii = pair<int, int>;\r\n#define f first\r\n#define s second\r\n\r\nusing vll = vector<ll>;\r\nusing vi = vector<int>;\r\nusing vvll = vector<vector<ll>>;\r\nusing vvi = vector<vector<int>>;\r\nusing vpii = vector<pair<int, int>>;\r\nusing vpll = vector<pair<ll, ll>>;\r\n\r\n#define FOR(i, a) for(int i = 0; i < a; i++)\r\n#define ROF(i, a) for(int i = a; i >= 0; i--)\r\n#define FORA(i, a, b) for(int i = a; i <= b; i++)\r\n#define ROFA(i, a, b) for(int i = b; i >= a; i--)\r\n\r\n\r\n\r\nvoid solve(){\r\n    \r\n}\r\n\r\nint main(){\r\n    ios::sync_with_stdio(false); cin.tie(nullptr);\r\n    solve();\r\n}\r\n	1	cpp	\N	-1	ERROR	Sample Problem	1	1747763201136	Grading server error:\nError: read ECONNRESET	\N
10	1003241	using int 'string' 1241 = {\r\n\t;\r\n}	1	cpp	-1	-1	Running	Sample Problem	1	1747764013697	\N	\N
11	\N	            sigma	1	cpp	\N	-1	ERROR	Sample Problem	1	1747772243042	Grading server error:\nError: read ECONNRESET	\N
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (team_id, user_id, joined_at) FROM stdin;
3	1003241	2025-05-21 18:20:12.636678
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, name, created_at, secret_code, contest_score) FROM stdin;
1	cookie lovers	2025-05-21 18:03:42.025553	\N	0
2	paul yoo fan club	2025-05-21 18:05:44.505645	\N	0
3	cookie monsters	2025-05-21 18:14:26.692378	a57cfba7	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, display_name, username, rating, admin, usaco_division, cf_rating, cf_handle, email, pass) FROM stdin;
12345	Test User	2028testuser	1234	f	silver	4009	tourist	test@test.com	Qwert1!
1003241	Zain Marshall	2028zmarshal	1500	f	silver	1110	MoxieTheFoxie	zainmarshall1000@gmail.com	1234
\.


--
-- Name: checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checker_id_seq', 1, true);


--
-- Name: checkers_checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checkers_checker_id_seq', 1, true);


--
-- Name: contests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contests_id_seq', 1, true);


--
-- Name: problems_pid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.problems_pid_seq', 1, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.submissions_id_seq', 11, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teams_id_seq', 3, true);


--
-- Name: checker checker_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checker
    ADD CONSTRAINT checker_pkey PRIMARY KEY (id);


--
-- Name: checkers checkers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkers
    ADD CONSTRAINT checkers_pkey PRIMARY KEY (checker_id);


--
-- Name: contests contests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_pkey PRIMARY KEY (id);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (pid);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (team_id, user_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: teams teams_secret_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_secret_code_key UNIQUE (secret_code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: problems problems_checkerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_checkerid_fkey FOREIGN KEY (checkerid) REFERENCES public.checker(id);


--
-- Name: problems problems_contestid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_contestid_fkey FOREIGN KEY (contestid) REFERENCES public.contests(id);


--
-- Name: submissions submissions_contest_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_contest_fkey FOREIGN KEY (contest) REFERENCES public.contests(id);


--
-- Name: submissions submissions_problemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_problemid_fkey FOREIGN KEY (problemid) REFERENCES public.problems(pid);


--
-- Name: submissions submissions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

