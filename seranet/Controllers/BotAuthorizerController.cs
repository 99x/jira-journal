using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Workplace.Eureka.Services.Data;
using Workplace.Eureka.Services.Models;
using Workplace.Eureka.Services.Secrets;

namespace Workplace.Eureka.Services.Controllers
{
    [Produces("application/json")]
    [Route("workplace/bot")]
    public class BotAuthorizerController : Controller
    {
        readonly DbContext db;
        readonly Decrypt decypher;

        public BotAuthorizerController(SeranetDb ctx, Decrypt decrypt)
        {
            db = ctx;
            decypher = decrypt;
        }

        [HttpPost("auth")]
        public IActionResult Authenticate(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest();
            }

            try
            {
                const string FindEmployeeSql = @"SELECT user_name [Name], system_id [Username], email_address [EmailAddress], user_jira_department [Department] 
                                                FROM dbo.JiraUsers 
                                                WHERE system_id = '{0}' OR email_address = '{0}' AND is_deleted = 0";

                Employee emp = db.SqlQuery<Employee>(string.Format(FindEmployeeSql, username))
                                 .ToList()
                                 .FirstOrDefault();

                if (emp == null)
                {
                    return NotFound(new { username });
                }

                const string GetJiraAccountsSql = @"SELECT JiraAccounts.account [Name], JiraAccounts.description [Description], JiraUserData.jira_url [Url] 
                                                                            FROM dbo.JiraAccounts INNER JOIN dbo.JiraUserData 
                                                                                ON JiraAccounts.account_id = JiraUserData.account_id
                                                                            WHERE JiraUserData.is_deleted = 0 AND JiraUserData.user_id IN
                                                                            (SELECT user_id FROM dbo.JiraUsers WHERE system_id = '{0}' OR email_address = '{0}')";

                IEnumerable<JiraAccount> accounts = db.SqlQuery<JiraAccount>(string.Format(GetJiraAccountsSql, username))
                                                      .ToList()
                                                      .Select(model => new JiraAccount
                                                      {
                                                          Name = model.Name,
                                                          Description = model.Description,
                                                          Url = decypher.Decrypts(model.Url)
                                                      });

                return Ok(new
                {
                    Header = new
                    {
                        Impersonated = true,
                        AuthToken = decypher.Decrypts(username)
                    },
                    Payload = new
                    {
                        UsernameOrEmail = username,
                        Profile = emp,
                        Instances = accounts,
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("user/{username}/auth")]
        public IActionResult Authorize(string username, string taskId)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(taskId))
            {
                return BadRequest();
            }
            taskId = taskId.Contains("-") ? taskId.Remove(taskId.IndexOf('-')) : taskId;

            const string FindProjectSql = @"SELECT JiraProjects.project_key [Key], JiraUserData.jira_url [Url], JiraUserData.external_user_name [Username], JiraUserData.password [Password] 
                                                FROM dbo.JiraProjects INNER JOIN dbo.JiraUserData 
                                                    ON JiraProjects.account_id = JiraUserData.account_id
                                                WHERE JiraProjects.project_key = '{1}' AND JiraUserData.is_deleted = 0 AND JiraUserData.user_id IN 
                                                (SELECT user_id FROM dbo.JiraUsers WHERE system_id = '{0}' or email_address = '{0}')";

            JiraProject proj = db.SqlQuery<JiraProject>(string.Format(FindProjectSql, username, taskId))
                                 .ToList()
                                 .Select(model => new JiraProject
                                 {
                                     Key = model.Key,
                                     Username = decypher.Decrypts(model.Username),
                                     Password = decypher.Decrypts(model.Password),
                                     Url = decypher.Decrypts(model.Url)
                                 })
                                 .FirstOrDefault();

            if (proj == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                Header = new
                {
                    AuthToken = decypher.Decrypts($"{username}.{taskId}")
                },
                Payload = new
                {
                    UsernameOrEmail = username,
                    Task = taskId,
                    Project = proj
                }
            });
        }
    }
}
