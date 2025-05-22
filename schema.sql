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
-- Name: checker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checker (
    id integer NOT NULL,
    code text,
    lang character varying(20)
);


ALTER TABLE public.checker OWNER TO postgres;

--
-- Name: checker_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checker_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checker_id_seq OWNER TO postgres;

--
-- Name: checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checker_id_seq OWNED BY public.checker.id;


--
-- Name: checkers; Type: TABLE; Schema: public; Owner: zain
--

CREATE TABLE public.checkers (
    checker_id integer NOT NULL,
    checker_code text NOT NULL,
    language character varying(50) NOT NULL
);


ALTER TABLE public.checkers OWNER TO zain;

--
-- Name: checkers_checker_id_seq; Type: SEQUENCE; Schema: public; Owner: zain
--

CREATE SEQUENCE public.checkers_checker_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkers_checker_id_seq OWNER TO zain;

--
-- Name: checkers_checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zain
--

ALTER SEQUENCE public.checkers_checker_id_seq OWNED BY public.checkers.checker_id;


--
-- Name: contests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contests (
    id integer NOT NULL,
    name character varying(100),
    start timestamp without time zone,
    "end" timestamp without time zone,
    rated boolean DEFAULT false,
    editorial text
);


ALTER TABLE public.contests OWNER TO postgres;

--
-- Name: contests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contests_id_seq OWNER TO postgres;

--
-- Name: contests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contests_id_seq OWNED BY public.contests.id;


--
-- Name: problems; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.problems OWNER TO postgres;

--
-- Name: problems_pid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.problems_pid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.problems_pid_seq OWNER TO postgres;

--
-- Name: problems_pid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.problems_pid_seq OWNED BY public.problems.pid;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
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
    insight text
);


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submissions_id_seq OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    display_name character varying(100),
    username character varying(100),
    rating integer DEFAULT 1500,
    admin boolean DEFAULT false,
    usaco_division character varying(20),
    cf_rating integer,
    cf_handle character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: checker id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checker ALTER COLUMN id SET DEFAULT nextval('public.checker_id_seq'::regclass);


--
-- Name: checkers checker_id; Type: DEFAULT; Schema: public; Owner: zain
--

ALTER TABLE ONLY public.checkers ALTER COLUMN checker_id SET DEFAULT nextval('public.checkers_checker_id_seq'::regclass);


--
-- Name: contests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contests ALTER COLUMN id SET DEFAULT nextval('public.contests_id_seq'::regclass);


--
-- Name: problems pid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems ALTER COLUMN pid SET DEFAULT nextval('public.problems_pid_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Data for Name: checker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checker (id, code, lang) FROM stdin;
1	return 0;	cpp
\.


--
-- Data for Name: checkers; Type: TABLE DATA; Schema: public; Owner: zain
--

COPY public.checkers (checker_id, checker_code, language) FROM stdin;
1	return a == b;	Python
\.


--
-- Data for Name: contests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contests (id, name, start, "end", rated, editorial) FROM stdin;
1	Sample Contest	2025-05-18 15:09:00.535992	2025-05-18 17:09:00.535992	t	https://example.com/editorial
\.


--
-- Data for Name: problems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problems (pid, name, contestid, checkerid, tl, ml, interactive, statement, secret, solution, sollang, inputtxt, outputtxt, samples, points) FROM stdin;
1	Sample Problem	1	1	2000	256	f	This is a sample problem statement.	f		cpp	1 2	3	Input: 1 2\\nOutput: 3	100
2	A+B Problem	1	1	1000	256	f	Given two integers a and b, output their sum.	f		\N	1 2\\n	3\\n	1 2\\n3\\n	100
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submissions (id, usr, code, problemid, language, runtime, memory, verdict, problemname, contest, "timestamp", insight) FROM stdin;
1	\N		1	python	\N	-1	ERROR	Sample Problem	1	1747671265211	Grading server error:\nError: read ECONNRESET
2	\N	#include <bits/stdc++.h>\r\n\r\nusing namespace std;\r\n\r\nint main(){\r\n\tint a, b; cin >> a >> b;\r\n\tcout << (a+b) << endl;\r\n}	2	cpp	\N	-1	ERROR	A+B Problem	1	1747677577154	Grading server error:\nError: read ECONNRESET
3	\N	#include <bits/stdc++.h>\r\n\r\n\r\nint. main((){\r\n\tl;\r\n}	1	cpp	\N	-1	ERROR	Sample Problem	1	1747680769762	Grading server error:\nError: read ECONNRESET
4	\N	#include <bits/stdc++.h>\r\n\r\nusing namespace std;\r\n\r\nusing ll = long long;\r\nusing d = double;\r\nusing str = string;\r\n\r\nusing pll = pair<ll, ll>;\r\nusing pii = pair<int, int>;\r\n#define f first\r\n#define s second\r\n\r\nusing vll = vector<ll>;\r\nusing vi = vector<int>;\r\nusing vvll = vector<vector<ll>>;\r\nusing vvi = vector<vector<int>>;\r\nusing vpii = vector<pair<int, int>>;\r\nusing vpll = vector<pair<ll, ll>>;\r\n\r\n#define FOR(i, a) for(int i = 0; i < a; i++)\r\n#define ROF(i, a) for(int i = a; i >= 0; i--)\r\n#define FORA(i, a, b) for(int i = a; i <= b; i++)\r\n#define ROFA(i, a, b) for(int i = b; i >= a; i--)\r\n\r\n\r\n\r\nvoid solve(){\r\n    int a, b; cin >> a >> b;\r\n\tcout << (a+b) << "\\n";\r\n}\r\n\r\nint main(){\r\n    ios::sync_with_stdio(false); cin.tie(nullptr);\r\n    solve();\r\n}\r\n	2	cpp	\N	-1	ERROR	A+B Problem	1	1747705985562	Grading server error:\nError: read ECONNRESET
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, display_name, username, rating, admin, usaco_division, cf_rating, cf_handle) FROM stdin;
12345	Zain Marshall	2028zmarshal	1234	t	silver	4009	tourist
\.


--
-- Name: checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checker_id_seq', 1, true);


--
-- Name: checkers_checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zain
--

SELECT pg_catalog.setval('public.checkers_checker_id_seq', 1, true);


--
-- Name: contests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contests_id_seq', 1, true);


--
-- Name: problems_pid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.problems_pid_seq', 1, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submissions_id_seq', 4, true);


--
-- Name: checker checker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checker
    ADD CONSTRAINT checker_pkey PRIMARY KEY (id);


--
-- Name: checkers checkers_pkey; Type: CONSTRAINT; Schema: public; Owner: zain
--

ALTER TABLE ONLY public.checkers
    ADD CONSTRAINT checkers_pkey PRIMARY KEY (checker_id);


--
-- Name: contests contests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_pkey PRIMARY KEY (id);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (pid);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: problems problems_checkerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_checkerid_fkey FOREIGN KEY (checkerid) REFERENCES public.checker(id);


--
-- Name: problems problems_contestid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_contestid_fkey FOREIGN KEY (contestid) REFERENCES public.contests(id);


--
-- Name: submissions submissions_contest_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_contest_fkey FOREIGN KEY (contest) REFERENCES public.contests(id);


--
-- Name: submissions submissions_problemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_problemid_fkey FOREIGN KEY (problemid) REFERENCES public.problems(pid);


--
-- PostgreSQL database dump complete
--

