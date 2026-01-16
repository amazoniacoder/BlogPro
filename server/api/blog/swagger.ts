/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Blog post management
 */

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlogPost'
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog post title
 *               description:
 *                 type: string
 *                 description: Short description/summary for SEO
 *               content:
 *                 type: string
 *                 description: Full content of the blog post
 *               category:
 *                 type: string
 *                 description: Blog post category
 *               imageUrl:
 *                 type: string
 *                 description: URL to blog post main image
 *               thumbnailUrl:
 *                 type: string
 *                 description: URL to blog post thumbnail image
 *               projectUrl:
 *                 type: string
 *                 description: URL to external article or related project
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of technologies discussed in the post
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tags for categorization
 *               slug:
 *                 type: string
 *                 description: SEO-friendly URL identifier
 *               status:
 *                 type: string
 *                 enum: [published, draft, archived]
 *                 default: draft
 *                 description: Post status
 *     responses:
 *       201:
 *         description: Blog post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogPost'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Get blog post by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogPost'
 *       404:
 *         description: Blog post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */