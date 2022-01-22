// OutStem Back-End Challenge
// Albert Quon
// 2022/01/16

// Run with node solution.js

// GET https://interview.outstem.io/tests?test_case=<TEST_CASE_NUMBER_1-6>
// POST https://interview.outstem.io/tests?test_case=<TEST_CASE_NUMBER_1-6>
import axios from 'axios';

axios.defaults.headers.common = {
    "Content-Type": "application/json"
}

let data = null;

const args = process.argv; // for general testing with CLI

let url = args.length > 2 ? "https://interview.outstem.io/tests?test_case="+args[2] : "https://interview.outstem.io/tests?test_case=3"; 



try {
    axios.get(url).then((response) =>{
        //console.log(response);
        data = response.data;
        //console.log(data)
        if (data != null) {
            
            // Initialize Data
            let table = new CustomTable(data.data);
            //console.log(data.data);
            let query = data.query.split(", ");
            let resultResponse = [];
            // Handle Query
            let i = 0;
            while (i < query.length) {
               // console.log(query[i]);
                switch(query[i++]) {
                    case("EducatorOnline"):
                        table.AddEducatorOnline(query[i++], query[i++], query[i++]);
                        break;
                    case("EducatorOffline"):
                        table.RemoveEducatorOffline(query[i++], query[i++]);
                        break;
                    case("UpdateViews"):
                        table.UpdateViews(query[i++], query[i++], query[i++]);
                        break;
                    case("UpdateSubject"):
                        table.UpdateSubjects(query[i++], query[i++], query[i++]);
                        break;
                    case("TopEducator"):
                        resultResponse.push(table.FindTopEducator());
                        break;
                    case("ViewsInSubject"):
                        resultResponse.push(table.FindViewsInSubject(query[i++]));
                        break;
                    case("TopEducatorOfSubject"):
                        resultResponse.push(table.FindTopEducatorOfSubject(query[i++]));
                        break;
                }
            }
            // console.log(table.table);
            console.log(resultResponse);
            
            axios.post(url, {
                "results": resultResponse
            }).then(function (response) {
                console.log(response.data);
            }).catch(function (error) {
                console.log(error);
            });
            
        
        } else {
            console.log("No data found");
        }
    
        
    });
} catch (error) {
    console.log(error);
}

function CustomTable(data) {
    this.table = {};

    // Data Structure Methods ***************
    this.AddEducatorOnline = function(name, views, subject) {
        this.table[name] = {subject: subject, views: parseInt(views)};
        console.log("Educator added: " + name + subject + views);
    }

    this.UpdateViews = function(name, views, subject) {
        if (subject.trim() === this.table[name].subject.trim()) {
            this.table[name].views = parseInt(views);
        }
        console.log( name+ " New:" + views+ " Old:" + this.table[name].views);
    }

    this.RemoveEducatorOffline = function(name, subject) {
        if (subject === this.table[name].subject) {
            delete this.table[name];
        }
        console.log("Educator removed: " + name);
    }

    this.UpdateSubjects = function(name, currSubj, newSubj) {
        if (currSubj.trim() === this.table[name].subject.trim()) {
            this.table[name].subject = newSubj; // Assuming viewers transfer to new subject
            console.log("updated subject to" + newSubj + " for " + name);
        }
    }


    // Query Methods ***************
    this.FindViewsInSubject= function(subject) {
        var totalViews = 0;
        for (const name in this.table) {
            if (subject.trim()  === this.table[name].subject.trim() ) { // .trim() to fix whitespace issues
                totalViews += this.table[name].views;
            }
        }
        return totalViews.toString();
    }

    this.FindTopEducatorOfSubject = function(subject) {
        var highestViews = -1;
        var educator = "null";
        for (const name in this.table) {
            if (subject.trim() === this.table[name].subject.trim()) { // .trim() to fix whitespace issues
                if (highestViews < this.table[name].views) {
                    highestViews = this.table[name].views;
                    educator = name;
                }
            }
        }
        return educator;
    }

    this.FindTopEducator = function() {
        if (Object.keys(this.table).length == 0) {
            return "null";
        }
        let highestViews = -1;
        let highestSubjectViews = -1;
        let subjectViews = {}; // store subject with its views in map
        let popularTeachers = []; // store most popular teachers
        let popTeacherSubjects = []; // store subjects taught by most popular teachers
        
        // Find highest value
        for (const name in this.table) {
            let educator = this.table[name];
            if (highestViews < educator.views) {
                highestViews = educator.views;
                popularTeachers = []; // Clear, new highest value found
                popTeacherSubjects = []; // Clear, new highest value found
                educator.name = name;
                popularTeachers.push(educator);
                popTeacherSubjects.push(educator.subject);
            } else if (highestViews === educator.views) {
                popularTeachers.push(educator);
                if (popTeacherSubjects.indexOf(educator.subject) < 0) {
                    popTeacherSubjects.push(educator.subject);
                }
            }
        }

        // Check if there's only one popular educator found
        if (popularTeachers.length === 1) {
            return popularTeachers[0].name;
        }


        // Add up the views of all subjects for popular teachers
        for (const name in this.table) {
            let subject = this.table[name].subject;

            if (subject in subjectViews) {
                subjectViews[subject] += this.table[name].views;
            } else if (popTeacherSubjects.indexOf(subject) > -1) {
                subjectViews[subject] = this.table[name].views;
            }
        }
        
        var mostViewSubjects = []; // now store the most popular subjects
        for (const subject in subjectViews) { 
            if (subjectViews[subject] > highestSubjectViews) {
                mostViewSubjects = [];
                highestSubjectViews = subjectViews[subject];
                mostViewSubjects.push(subject);
            } else if (subjectViews[subject] === highestSubjectViews) {
                highestSubjectViews = subjectViews[subject];
                mostViewSubjects.push(subject);
            }
        }

        if (mostViewSubjects.length === 1) {
            for (let i = 0; i < popularTeachers.length; i++) {
                if (popularTeachers[i].subject === mostViewSubjects[0]) {
                    return popularTeachers[i].name;
                }
            }
        }
        
        for(let i = 0; i < popularTeachers.length; i++) {
            for (const subject in mostViewSubjects) {
                if (subject.trim() === popularTeachers[i].subject.trim()) { // Return first teacher found with any popular subject 
                    return popularTeachers[i].name;
                }
            }
        }
        
        return "null"; 
    }

    // Constructor
    for(var i = 0; i < data.length; i+=3) {
        this.AddEducatorOnline(data[i], data[i+1], data[i+2]);
    }

}












